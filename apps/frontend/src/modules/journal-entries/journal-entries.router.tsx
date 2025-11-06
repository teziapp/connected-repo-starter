import CreateJournalEntryPage from "@frontend/modules/journal-entries/pages/CreateJournalEntry.page";
import JournalEntriesPage from "@frontend/modules/journal-entries/pages/JournalEntries.page";
import JournalEntryDetailPage from "@frontend/modules/journal-entries/pages/JournalEntryDetail.page";
import { Route, Routes } from "react-router";

export const JournalEntriesRouter = () => {
	return (
		<Routes>
      <Route path="/" element={<JournalEntriesPage />} />
      <Route path="/new" element={<CreateJournalEntryPage />} />
      <Route path="/:entryId" element={<JournalEntryDetailPage />} />
    </Routes>
	);
};

export default JournalEntriesRouter;