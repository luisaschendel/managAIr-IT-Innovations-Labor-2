interface GeminiOfferProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function ChatGPTOffer({ onAccept, onDecline }: GeminiOfferProps) {
  return (
    <div className="my-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Gemini logo */}
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
          <svg viewBox="0 0 28 28" className="w-6 h-6" fill="none">
            <path
              d="M14 2C14 2 8 8.5 8 14s6 12 6 12 6-6.5 6-12S14 2 14 2z"
              fill="white"
              fillOpacity="0.9"
            />
            <path
              d="M2 14c0 0 6.5-6 12-6s12 6 12 6-6.5 6-12 6S2 14 2 14z"
              fill="white"
              fillOpacity="0.5"
            />
          </svg>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Gemini</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-medium">Extern</span>
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            Diese Frage geht über die internen Projektdaten hinaus.
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Soll ein externer Gemini-Chat geöffnet werden? Interne Daten werden dabei <strong>nicht</strong> geteilt.
          </p>

          <div className="flex gap-2">
            <button
              onClick={onAccept}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all text-sm font-medium shadow-sm"
            >
              <svg viewBox="0 0 20 20" className="w-4 h-4 fill-white">
                <path d="M10 2C10 2 5.5 6.8 5.5 10s4.5 8 4.5 8 4.5-4.8 4.5-8S10 2 10 2z"/>
                <path d="M2 10c0 0 4.8-4.5 8-4.5s8 4.5 8 4.5-4.8 4.5-8 4.5S2 10 2 10z" opacity="0.5"/>
              </svg>
              Ja, Gemini öffnen
            </button>
            <button
              onClick={onDecline}
              className="px-4 py-2 bg-white text-foreground border border-border rounded-lg hover:bg-accent transition-colors text-sm font-medium"
            >
              Nein
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
