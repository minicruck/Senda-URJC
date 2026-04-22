import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import { TripRuntimeProvider, useTripRuntime } from "../hooks/useTripRuntime";
import { useThresholds } from "../services/storage";
import TripPanel from "../components/TripPanel";
import TripMap from "../components/TripMap";
import CompanionView from "../components/CompanionView";
import PrealertModal from "../components/PrealertModal";
import SecurityPanel from "../components/SecurityPanel";
import IncidentReportModal from "../components/IncidentReportModal";
import type { Route } from "../types/route";
import type { Recipient } from "../types/trip";

interface TripNavState {
  route?: Route;
  recipient?: Recipient;
}

export default function TripPage() {
  const location = useLocation();
  const { user } = useAuth();
  const [thresholds] = useThresholds();
  const state = location.state as TripNavState | null;

  if (!user) return <Navigate to="/login" replace />;
  if (!state?.route || !state.recipient) {
    return <Navigate to="/routes" replace state={{ missingTrip: true }} />;
  }

  return (
    <TripRuntimeProvider
      route={state.route}
      recipient={state.recipient}
      user={user}
      thresholds={thresholds}
    >
      <TripScreen />
    </TripRuntimeProvider>
  );
}

function TripScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    tripState,
    anomalyKind,
    prealertRemainingSec,
    currentPosition,
    confirmOk,
    escalateNow,
  } = useTripRuntime();

  const [incidentOpen, setIncidentOpen] = useState<boolean>(false);
  const [incidentSuccess, setIncidentSuccess] = useState<boolean>(false);

  const showPrealert = tripState === "prealert";
  const inAlert = tripState === "alert";
  const terminal = tripState === "completed" || tripState === "cancelled";

  return (
    <section className="flex flex-1 flex-col">
      {inAlert && (
        <div
          role="alert"
          className="bg-urjc-red px-4 py-3 text-center text-sm font-semibold text-white"
        >
          {t("trip.alert.banner")}
        </div>
      )}

      {terminal && (
        <div
          role="status"
          className={`px-4 py-3 text-center text-sm font-semibold ${
            tripState === "completed"
              ? "bg-green-600 text-white"
              : "bg-gray-700 text-white"
          }`}
        >
          <span>{t(`trip.terminal.${tripState}`)}</span>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="ml-3 rounded bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {t("trip.terminal.backHome")}
          </button>
        </div>
      )}

      {incidentSuccess && (
        <div
          role="status"
          className="bg-green-50 px-4 py-2 text-center text-xs font-semibold text-green-800"
        >
          {t("incident.page.success")}
        </div>
      )}

      <div className="flex flex-1 flex-col lg:flex-row">
        <aside className="w-full lg:w-[340px] lg:flex-shrink-0">
          <TripPanel />
        </aside>

        <div className="relative h-[55vh] min-h-[400px] w-full flex-shrink-0 lg:h-auto lg:flex-1 lg:flex-shrink">
          <TripMap />

          {!terminal && (
            <button
              type="button"
              onClick={() => setIncidentOpen(true)}
              aria-label={t("incident.fab.label")}
              title={t("incident.fab.label")}
              className="absolute bottom-6 right-6 z-[1000] inline-flex h-14 w-14 items-center justify-center rounded-full bg-urjc-red text-white shadow-lg hover:bg-urjc-red-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-urjc-red"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="26"
                height="26"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2 1 21h22Zm-1 6h2v7h-2Zm0 9h2v2h-2Z" />
              </svg>
            </button>
          )}
        </div>

        <aside className="flex w-full flex-col gap-3 border-t border-gray-200 bg-gray-50 p-3 lg:w-[340px] lg:flex-shrink-0 lg:overflow-y-auto lg:border-l lg:border-t-0">
          <CompanionView />
          {inAlert && <SecurityPanel />}
          <div className="text-xs text-gray-500">
            <Link
              to="/profile"
              className="rounded px-1 py-0.5 underline hover:text-urjc-red focus:outline-none focus-visible:ring-2 focus-visible:ring-urjc-red"
            >
              {t("trip.links.adjustThresholds")}
            </Link>
          </div>
        </aside>
      </div>

      <PrealertModal
        open={showPrealert}
        anomalyKind={anomalyKind}
        remainingSec={prealertRemainingSec}
        onConfirmOk={confirmOk}
        onEscalate={escalateNow}
      />

      {user && (
        <IncidentReportModal
          isOpen={incidentOpen}
          onClose={() => setIncidentOpen(false)}
          user={user}
          fixedLocation={currentPosition}
          onSubmitted={() => {
            setIncidentSuccess(true);
            window.setTimeout(() => setIncidentSuccess(false), 4000);
          }}
        />
      )}
    </section>
  );
}
