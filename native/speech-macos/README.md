# macOS dictation helper

`pnpm build:speech-macos` compiles a universal Swift helper. The macOS development
launcher builds the host architecture and places it beside Electron; packaged
builds ship it in `Contents/MacOS`. Xcode command-line tools are required.

The helper recognizes a private temporary WAV through `SFSpeechRecognizer` with
`requiresOnDeviceRecognition` enabled. It uses the system locale and never falls
back to Apple's server recognition. macOS owns the language assets; Orca cannot
download or delete them. Sessions are limited to one minute, and temporary audio
is removed after success or failure. Authorization and unavailable on-device
language support are reported through the existing dictation error channel.

## macOS validation

1. Run `ORCA_BACKGROUND_LAUNCH=1 pnpm dev` on an isolated display.
2. Enable voice dictation and select **macOS Speech**. No model download or delete
   controls should appear for this engine.
3. Grant microphone and Speech Recognition permission, dictate using the existing
   shortcut, stop, and check that the final text is inserted.
4. Deny Speech Recognition permission in System Settings and repeat. Check that
   an actionable error appears and no transcription is inserted.
5. Test a language without installed on-device recognition assets and verify an
   error instead of network recognition.
6. Switch back to Parakeet or an OpenAI model and verify existing dictation.

Swift compilation, TCC attribution, signing, real audio recognition, and the
packaged app must be validated on macOS; Linux unit tests cannot establish these.
