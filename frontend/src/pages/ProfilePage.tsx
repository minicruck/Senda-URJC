import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import ContactsManager from "../components/ContactsManager";
import ThresholdsEditor from "../components/ThresholdsEditor";
import VolunteerToggle from "../components/VolunteerToggle";
import {
  useContacts,
  useStoredVolunteers,
  useThresholds,
} from "../services/storage";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [contacts, setContacts] = useContacts();
  const [thresholds, setThresholds] = useThresholds();
  const [volunteers, setVolunteers] = useStoredVolunteers();

  if (!user) return null;

  return (
    <section className="flex flex-1 flex-col gap-6 p-4 lg:mx-auto lg:w-full lg:max-w-3xl lg:p-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">
          {t("profile.heading")}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {t("profile.subheading", {
            name: user.displayName,
            email: user.email,
          })}
        </p>
      </header>

      <ContactsManager contacts={contacts} onChange={setContacts} />
      <ThresholdsEditor thresholds={thresholds} onChange={setThresholds} />
      <VolunteerToggle
        user={user}
        storedVolunteers={volunteers}
        onChange={setVolunteers}
      />
    </section>
  );
}
