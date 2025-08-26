# Gemini API Key Setup Template

This template helps you set up your Gemini API key and model for use with the Gemini CLI.

**Instructions:**

1.  **Open your VS Code Terminal:**
    - Go to the top menu: `Terminal` -> `New Terminal`.

2.  **Copy and Paste the commands below into your terminal.**
    - **IMPORTANT:** Replace `YOUR_PROFESSIONAL_API_KEY_HERE` with your actual API key.

---

### For Windows (PowerShell):

```powershell
$env:GEMINI_API_KEY = "YOUR_PROFESSIONAL_API_KEY_HERE"
$env:GEMINI_MODEL = "gemini-ultra"
```

### For Linux or macOS (Bash/Zsh):

```bash
export GEMINI_API_KEY="YOUR_PROFESSIONAL_API_KEY_HERE"
export GEMINI_MODEL="gemini-ultra"
```

---

**Remember:** These settings are for your current terminal session. If you close the terminal, you'll need to set them again. For permanent setup, you would add these lines to your shell's profile file (e.g., `.bashrc`, `.zshrc`, `profile.ps1`).
