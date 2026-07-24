// Fallback intent detection: substring matching on German text when no LLM is available.

const matchesKeywords = (text: string, keywords: string[]): boolean =>
  keywords.some((kw) => text.includes(kw));

export const isOnboardingQuestion = (text: string): boolean =>
  matchesKeywords(text, [
    "onboarding", "einführung", "einarbeitung", "getting started",
    "startanleitung", "setup guide", "erste schritte", "tutorial",
    "neu auf dem projekt", "neu im projekt", "neu im team",
  ]) || (text.includes("neu") && text.includes("projekt"));

export const isSprintStatusQuestion = (text: string): boolean =>
  matchesKeywords(text, [
    "sprint", "status", "fortschritt", "übersicht",
    "status des sprints", "sprint fortschritt", "wie läuft der sprint",
    "sprint übersicht", "sprint update", "aktueller stand",
    "wie läuft", "stand der dinge", "projektstatus",
    "wie läuft das projekt", "wie läuft es insgesamt", "wo stehen wir im projekt",
    "wie ist der projektstand", "wie weit sind wir im projekt", "wie ist der fortschritt",
    "wie kommen wir voran", "wie sieht es aktuell aus", "gibt es ein update zum projekt",
    "was ist der aktuelle projektstatus", "sind wir im zeitplan", "sind wir noch im rahmen",
    "sind wir on track", "sind wir hinterher", "hinken wir", "sind wir durch mit allem",
    "wie sieht die gesamtlage aus", "wie ist die performance", "gibt es risiken",
    "gibt es probleme", "gibt es verzögerungen",
    "update?", "projektupdate", "stand?", "lage?", "überblick?",
    "summary?", "report?", "gibt's was neues", "gibt es was neues",
    "bitte um statusbericht", "bitte um fortschrittsreport", "wie ist die kpi-lage",
    "wie sieht das reporting aus", "aktueller überblick", "executive summary",
    "läuft das ding", "sind wir gut unterwegs", "wo klemmt's", "wo klemmt es",
    "brennt irgendwas", "alles im grünen bereich", "sind wir safe",
    "kommen wir klar", "wie sieht's unterm strich aus", "wie siehts unterm strich aus",
    "wie läuft es", "wo stehen wir", "wie ist der stand", "wie weit sind wir",
  ]);

export const isAppointmentQuestion = (text: string): boolean =>
  matchesKeywords(text, [
    "termin", "meeting", "meetings", "kalender", "deadline", "deadlines",
    "wichtige daten", "zeitplan", "anstehende termine", "events",
    "besprechung", "besprechungen", "regeltermin", "jour fixe",
  ]);

export const isMyTasksQuestion = (text: string): boolean =>
  matchesKeywords(text, [
    "aufgabe", "aufgaben", "tasks", "to-dos", "todos",
    "arbeitspakete", "arbeitspaket", "offene punkte", "assignments",
    "tickets von mir", "meine tickets", "was muss ich machen",
    "meine aufgaben", "was steht an", "was ist zu tun",
    "was liegt gerade bei mir", "was liegt bei mir", "was ist mein part",
    "was ist mein anteil", "was soll ich heute machen", "wo muss ich ran",
    "was ist mein scope", "wofür bin ich zuständig", "was ist meine verantwortung",
    "was ist mir assigned", "was ist mein workload", "wie voll bin ich",
  ]);

export const isTicketCreationRequest = (text: string): boolean => {
  const createKeywords = [
    "erstelle", "füge", "lege an", "anlegen", "erstellen",
    "neues ticket", "neue aufgabe", "neuer task", "neue issue",
    "bug melden", "fehler melden", "ticket erstellen",
    "das sollten wir aufnehmen", "sollten wir aufnehmen", "aufnehmen",
    "das darf nicht verloren gehen", "nicht verloren gehen",
    "das müssen wir tracken", "müssen wir tracken",
    "das gehört dokumentiert", "gehört dokumentiert",
    "lass uns das festhalten", "das festhalten",
    "das sollten wir einplanen", "sollten wir einplanen",
    "das kommt auf die liste", "kommt auf die liste",
    "das brauchen wir im backlog", "brauchen wir im backlog",
  ];
  const ticketKeywords = ["ticket", "aufgabe", "task", "issue", "to-do", "vorgang"];
  const implicitKeywords = [
    "sollten wir aufnehmen", "darf nicht verloren gehen", "müssen wir tracken",
    "gehört dokumentiert", "lass uns das festhalten", "sollten wir einplanen",
    "kommt auf die liste", "brauchen wir im backlog",
  ];
  return (
    (matchesKeywords(text, createKeywords) && matchesKeywords(text, ticketKeywords)) ||
    matchesKeywords(text, implicitKeywords)
  );
};

export const isSharepointQuestion = (text: string): boolean =>
  matchesKeywords(text, [
    "sharepoint", "dokument", "dokumentation", "datei", "dateien",
    "unterlagen", "präsentation", "word", "excel", "pdf",
    "projektdokument", "spezifikation",
  ]);

export const isEmailQuestion = (text: string): boolean =>
  matchesKeywords(text, [
    "email", "e-mail", "mail", "posteingang", "nachricht", "nachrichten",
    "neue mails", "neue e-mails", "ungelesene", "inbox",
  ]);

export const isLoopQuestion = (text: string): boolean =>
  matchesKeywords(text, [
    "loop", "ms loop", "notizen", "notiz", "seite", "seiten",
    "gemeinsame notizen", "shared notes", "loop-seite",
  ]);

export const isContactQuestion = (text: string): boolean =>
  text.includes("wer ist") ||
  text.includes("wer war") ||
  text.includes("ansprechpartner") ||
  text.includes("kontakt") ||
  (text.includes("wer") &&
    (text.includes("product owner") ||
      text.includes("projekt manager") ||
      text.includes("projektmanager")));

export const isSendMessageRequest = (text: string): boolean => {
  const strongVerbs = ["informiere", "benachrichtige", "teile mit", "gib bescheid", "lass wissen"];
  const sendVerbs = ["schick", "sende", "senden"];
  const messageTargets = ["nachricht", "mail", "e-mail", "email", "teams", "message", "bescheid"];
  return (
    matchesKeywords(text, strongVerbs) ||
    (matchesKeywords(text, sendVerbs) && matchesKeywords(text, messageTargets))
  );
};
