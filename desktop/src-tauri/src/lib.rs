use serde::{Deserialize, Serialize};
use std::io::BufRead;
use std::process::{Command, Stdio};
use tauri::Emitter;

#[derive(Debug, Serialize, Deserialize, Clone)]
struct ProcessingProgress {
    stage: String,
    progress: i32,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    data: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ProcessSettings {
    source_language: String,
    target_language: String,
    subtitle_mode: String,
    whisper_model: String,
    llm_provider: String,
    api_key: String,
    no_translate: bool,
}

fn emit_progress(app: &tauri::AppHandle, stage: &str, progress: i32, message: &str) {
    let _ = app.emit(
        "cvr-progress",
        ProcessingProgress {
            stage: stage.into(),
            progress,
            message: message.into(),
            data: None,
        },
    );
}

#[tauri::command]
async fn start_processing(
    app: tauri::AppHandle,
    video_path: String,
    settings: ProcessSettings,
) -> Result<(), String> {
    eprintln!("[cvr] path={}", video_path);

    std::thread::spawn(move || {
        let result = run_cvr_cli(&app, &video_path, &settings);
        if let Err(e) = result {
            eprintln!("[cvr] ERROR: {}", e);
            emit_progress(&app, "error", 0, &e);
        }
    });
    Ok(())
}

fn run_cvr_cli(
    app: &tauri::AppHandle,
    video_path: &str,
    settings: &ProcessSettings,
) -> Result<(), String> {
    // Fix Windows UNC paths
    let video_path_fixed = video_path.replace('\\', "/");

    // Build command — NO env() calls to preserve CUDA/torch environment
    let mut cmd = Command::new("python");

    let mut args = vec![
        "-X".to_string(), "utf8".to_string(),  // Python UTF-8 mode
        "-m".to_string(), "cvr".to_string(),
        video_path_fixed.clone(),
        "--json-progress".to_string(),
        "-m".to_string(), settings.whisper_model.clone(),
        "--device".to_string(), "auto".to_string(),
        "--mode".to_string(), settings.subtitle_mode.clone(),
        "--provider".to_string(), settings.llm_provider.clone(),
    ];

    // Pass API key as argument (not env var)
    if !settings.api_key.is_empty() {
        args.push("--api-key".to_string());
        args.push(settings.api_key.clone());
    }

    if settings.source_language != "auto" {
        args.push("-l".to_string());
        args.push(settings.source_language.clone());
    }

    if !settings.no_translate {
        args.push("-t".to_string());
        args.push(settings.target_language.clone());
    } else {
        args.push("--no-translate".to_string());
    }

    cmd.args(&args);
    cmd.stdout(Stdio::piped()).stderr(Stdio::piped());

    eprintln!("[cvr] spawning: python {}", args.iter()
        .map(|a| if a.starts_with("AIza") || a.starts_with("sk-") { "***".to_string() } else { a.clone() })
        .collect::<Vec<_>>().join(" "));

    emit_progress(app, "extracting", 0, "Starting cvr...");

    let mut child = cmd.spawn().map_err(|e| {
        format!("Failed to start python: {}", e)
    })?;

    // Read stderr in background
    let stderr = child.stderr.take();
    let stderr_thread = std::thread::spawn(move || {
        let mut lines = Vec::new();
        if let Some(stderr) = stderr {
            let reader = std::io::BufReader::new(stderr);
            for line in reader.lines().flatten() {
                eprintln!("[stderr] {}", line);
                lines.push(line);
            }
        }
        lines
    });

    // Read stdout and emit progress events
    if let Some(stdout) = child.stdout.take() {
        let reader = std::io::BufReader::new(stdout);
        for line in reader.lines() {
            if let Ok(line) = line {
                eprintln!("[stdout] {}", line);
                if let Ok(progress) = serde_json::from_str::<ProcessingProgress>(&line) {
                    let _ = app.emit("cvr-progress", &progress);
                }
            }
        }
    }

    let status = child.wait().map_err(|e| format!("Process error: {}", e))?;
    let stderr_lines = stderr_thread.join().unwrap_or_default();

    eprintln!("[cvr] exit code: {:?}", status.code());

    if !status.success() {
        let last_lines: String = stderr_lines.iter().rev().take(10).rev()
            .cloned().collect::<Vec<_>>().join("\n");
        return Err(format!("cvr failed (code {:?}):\n{}", status.code(), last_lines));
    }

    Ok(())
}

#[derive(Debug, Serialize, Clone)]
struct GpuInfo {
    available: bool,
    name: String,
    vram_mb: u64,
    warning: String,
}

#[tauri::command]
fn detect_gpu() -> GpuInfo {
    // Use nvidia-smi to detect GPU (more reliable than torch)
    let output = Command::new("nvidia-smi")
        .args(["--query-gpu=name,memory.total", "--format=csv,noheader,nounits"])
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .output();

    match output {
        Ok(out) if out.status.success() => {
            let text = String::from_utf8_lossy(&out.stdout);
            let line = text.trim();
            // Format: "NVIDIA GeForce RTX 5080, 16303"
            if let Some((name, vram_str)) = line.split_once(',') {
                let name = name.trim().to_string();
                let vram_mb: u64 = vram_str.trim().parse().unwrap_or(0);
                let vram_gb = vram_mb as f64 / 1024.0;

                let warning = if vram_gb < 2.0 {
                    format!("VRAM {:.0}MB — too low for Whisper. Will use CPU.", vram_mb)
                } else if vram_gb < 4.0 {
                    "VRAM < 4GB — only Small model recommended.".to_string()
                } else if vram_gb < 6.0 {
                    "VRAM < 6GB — Small/Medium models only.".to_string()
                } else {
                    String::new()
                };

                GpuInfo { available: true, name, vram_mb, warning }
            } else {
                GpuInfo { available: false, name: String::new(), vram_mb: 0, warning: "Could not parse GPU info.".to_string() }
            }
        }
        _ => GpuInfo {
            available: false,
            name: String::new(),
            vram_mb: 0,
            warning: "No NVIDIA GPU detected. Will use CPU (slower).".to_string(),
        },
    }
}

#[tauri::command]
fn save_srt(content: String, output_path: String) -> Result<(), String> {
    std::fs::write(&output_path, &content).map_err(|e| format!("Failed to save: {}", e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![start_processing, save_srt, detect_gpu])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
