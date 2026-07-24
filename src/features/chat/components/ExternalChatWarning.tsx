export function ExternalChatWarning() {
  return (
    <div className="mb-6 mx-auto max-w-4xl">
      <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0 mt-0.5">⚠️</span>
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Externer Gemini-Chat</h4>
            <p className="text-sm text-gray-700">
              Dieser Chat nutzt Gemini (Google) und hat{" "}
              <strong>keinen Zugriff</strong> auf interne Projektdaten. Keine
              vertraulichen Informationen teilen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
