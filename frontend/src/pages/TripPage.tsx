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

  if (!user) {
    return <Navigate to="/login" replace />;
  }
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
  const {
    tripState,
    anomalyKind,
    prealertRemainingSec,
    confirmOk,
    escalateNow,
  } = useTripRuntime();

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

      <div className="flex flex-1 flex-col lg:flex-row">
        <aside className="w-full lg:w-[340px] lg:flex-shrink-0">
          <TripPanel />
        </aside>

        <div className="h-[55vh] min-h-[400px] w-full flex-shrink-0 lg:h-auto lg:flex-1 lg:flex-shrink">
          <TripMap />
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
    </section>
  );
}
