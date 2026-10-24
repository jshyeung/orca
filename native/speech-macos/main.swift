import Foundation
import Speech

func fail(_ message: String) -> Never {
    FileHandle.standardError.write(Data((message + "\n").utf8))
    exit(1)
}

guard CommandLine.arguments.count == 2 else { fail("Expected a WAV file") }
let audioURL = URL(fileURLWithPath: CommandLine.arguments[1])
var task: SFSpeechRecognitionTask?

SFSpeechRecognizer.requestAuthorization { status in
    DispatchQueue.main.async {
        guard status == .authorized else {
            fail("Enable Speech Recognition for Orca in System Settings > Privacy & Security.")
        }
        guard let recognizer = SFSpeechRecognizer(locale: Locale.current),
              recognizer.isAvailable, recognizer.supportsOnDeviceRecognition else {
            fail("On-device speech recognition is unavailable for the system language. Install its dictation assets in macOS settings.")
        }
        let request = SFSpeechURLRecognitionRequest(url: audioURL)
        request.requiresOnDeviceRecognition = true
        request.shouldReportPartialResults = false
        task = recognizer.recognitionTask(with: request) { result, error in
            if let result = result, result.isFinal {
                print(result.bestTranscription.formattedString)
                exit(0)
            }
            if let error = error { fail(error.localizedDescription) }
        }
    }
}
DispatchQueue.main.asyncAfter(deadline: .now() + 50) {
    task?.cancel()
    fail("macOS speech recognition timed out")
}
RunLoop.main.run()
