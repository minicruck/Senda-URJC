import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { EndpointKind, GeocodeSuggestion, LatLng } from "../types/route";
import { searchAddress } from "../services/geocoding";

export interface AddressSearchInputProps {
  kind: EndpointKind;
  value: LatLng | null;
  /** Label pushed from the parent (from reverse-geocode or picked suggestion). */
  externalLabel?: string | null;
  onSelect: (suggestion: GeocodeSuggestion) => void;
  onClear: () => void;
  onRequestUseCurrentLocation?: () => void;
  geolocating?: boolean;
}

const DEBOUNCE_MS = 400;
const MIN_CHARS = 3;

const LOCATION_ICON_SVG = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 7 11.5 7.35 11.76a1 1 0 0 0 1.3 0C13 21.5 20 15.25 20 10a8 8 0 0 0-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
  </svg>
);

export default function AddressSearchInput({
  kind,
  value,
  externalLabel,
  onSelect,
  onClear,
  onRequestUseCurrentLocation,
  geolocating = false,
}: AddressSearchInputProps) {
  const { t, i18n } = useTranslation();
  const inputId = useId();
  const listId = `${inputId}-list`;

  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);

  // Track the last externalLabel applied so we don't fight user typing.
  const lastExternalLabelRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (externalLabel !== lastExternalLabelRef.current) {
      lastExternalLabelRef.current = externalLabel;
      if (externalLabel) setQuery(externalLabel);
      else if (externalLabel === null && !value) setQuery("");
    }
  }, [externalLabel, value]);

  useEffect(() => {
    if (query.trim().length < MIN_CHARS || query === externalLabel) {
      setSuggestions([]);
      setLoading(false);
      setErrorKey(null);
      abortRef.current?.abort();
      return undefined;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setErrorKey(null);

    const timer = window.setTimeout(() => {
      searchAddress(query, {
        signal: controller.signal,
        language: i18n.resolvedLanguage,
      })
        .then((results: GeocodeSuggestion[]) => {
          if (controller.signal.aborted) return;
          setSuggestions(results);
          setOpen(true);
          setLoading(false);
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setErrorKey("errors.geocoding");
          setSuggestions([]);
          setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, externalLabel, i18n.resolvedLanguage]);

  const handlePick = (suggestion: GeocodeSuggestion): void => {
    onSelect(suggestion);
    setQuery(suggestion.displayName);
    setOpen(false);
  };

  const handleClear = (): void => {
    setQuery("");
    setSuggestions([]);
    setOpen(false);
    onClear();
  };

  const label =
    kind === "origin" ? t("route.origin.label") : t("route.destination.label");
  const placeholder =
    kind === "origin"
      ? t("route.origin.placeholder")
      : t("route.destination.placeholder");

  const coordsHint: string | null = value
    ? t("route.coordsShort", {
        lat: value.lat.toFixed(5),
        lng: value.lng.toFixed(5),
      })
    : null;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded={open && suggestions.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
            className="min-h-tap w-full rounded border border-gray-300 bg-white px-3 py-2 pr-9 text-sm text-gray-900 shadow-sm focus:border-urjc-red focus:outline-none focus-visible:ring-2 focus-visible:ring-urjc-red"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label={t("route.clear")}
              className="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-urjc-red"
            >
              ×
            </button>
          )}
          {open && suggestions.length > 0 && (
            <ul
              id={listId}
              role="listbox"
              className="absolute left-0 right-0 top-full z-[1500] mt-1 max-h-64 overflow-auto rounded border border-gray-200 bg-white shadow-lg"
            >
              {suggestions.map((s: GeocodeSuggestion) => (
                <li key={s.id} role="option" aria-selected="false">
                  <button
                    type="button"
                    className="block w-full truncate px-3 py-2 text-left text-sm text-gray-800 hover:bg-urjc-red hover:text-white focus:bg-urjc-red focus:text-white focus:outline-none"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handlePick(s)}
                  >
                    {s.displayName}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {kind === "origin" && onRequestUseCurrentLocation && (
          <button
            type="button"
            onClick={onRequestUseCurrentLocation}
            disabled={geolocating}
            aria-label={t("route.useCurrentLocation")}
            title={t("route.useCurrentLocation")}
            className="inline-flex min-h-tap min-w-tap shrink-0 items-center justify-center rounded border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-urjc-red disabled:opacity-60"
          >
            {LOCATION_ICON_SVG}
          </button>
        )}
      </div>

      <div className="min-h-[1.25rem] text-xs" aria-live="polite">
        {loading && (
          <span className="text-gray-500">{t("route.searching")}</span>
        )}
        {!loading && errorKey && (
          <span className="text-red-600">{t(errorKey)}</span>
        )}
        {!loading && !errorKey && coordsHint && (
          <span className="text-gray-500">{coordsHint}</span>
        )}
      </div>
    </div>
  );
}
