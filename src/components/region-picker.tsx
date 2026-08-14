import { useMemo, useState } from "react";
import { Droplet, Leaf } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AREAS, type Area } from "@/lib/regions";
import { normalise } from "@/lib/place-search";
import { currentPosition, placeFromCoords, type Place } from "@/lib/weather";

const unique = (list: string[]) => [...new Set(list)];

export function RegionPicker({
  onSelect,
  busy = false,
}: {
  onSelect: (place: Place, area?: Area) => void;
  busy?: boolean;
}) {
  const [country, setCountry] = useState<string>(AREAS[0]?.country ?? "");
  const [division, setDivision] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [locating, setLocating] = useState(false);

  const countries = useMemo(() => unique(AREAS.map((area) => area.country)), []);
  const divisions = useMemo(
    () => unique(AREAS.filter((area) => area.country === country).map((area) => area.division)),
    [country],
  );
  const districts = useMemo(
    () =>
      unique(
        AREAS.filter(
          (area) => area.country === country && (!division || area.division === division),
        ).map((area) => area.district),
      ),
    [country, division],
  );
  const cities = useMemo(
    () =>
      AREAS.filter(
        (area) =>
          area.country === country &&
          (!division || area.division === division) &&
          (!district || area.district === district),
      ),
    [country, division, district],
  );

  function pickCity(cityName: string) {
    const area = cities.find((item) => item.city === cityName);
    if (!area) return;
    onSelect(
      {
        name: area.city,
        country: area.country,
        latitude: area.latitude,
        longitude: area.longitude,
      },
      area,
    );
  }

  async function useGps() {
    setLocating(true);
    try {
      const position = await currentPosition();
      const place = await placeFromCoords(position.coords.latitude, position.coords.longitude);
      onSelect(place);
    } catch {
      /* the user can still pick a region by hand */
    } finally {
      setLocating(false);
    }
  }

  /** Matches a searched place back to our area profiles when we know the spot. */
  function areaFor(place: Place) {
    const key = normalise(place.name);
    return (
      AREAS.find((item) => normalise(item.city) === key) ??
      AREAS.find((item) => normalise(item.district) === key)
    );
  }

  return (
    <section
      className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7"
      aria-labelledby="region-heading"
    >
      <h2 id="region-heading" className="text-lg font-bold text-foreground">
        Choose your farm location
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Disease pressure changes from district to district. Pick your area or use GPS for the
        closest match.
      </p>

      <LocationAutocomplete
        className="mt-4"
        disabled={busy}
        onSelect={(place, local) => {
          if (local) {
            setCountry(local.country);
            if (local.country === "Bangladesh") {
              setDivision(local.division);
              setDistrict(local.parent);
            }
          }
          onSelect(place, areaFor(place));
        }}
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Country">
          <Select
            value={country}
            onValueChange={(value) => {
              setCountry(value);
              setDivision("");
              setDistrict("");
            }}
          >
            <SelectTrigger className="min-h-11" aria-label="Country">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Division / State">
          <Select
            value={division}
            onValueChange={(value) => {
              setDivision(value);
              setDistrict("");
            }}
          >
            <SelectTrigger className="min-h-11" aria-label="Division or state">
              <SelectValue placeholder="Select division" />
            </SelectTrigger>
            <SelectContent>
              {divisions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="District">
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger className="min-h-11" aria-label="District">
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="City / Upazila">
          <Select onValueChange={pickCity}>
            <SelectTrigger className="min-h-11" aria-label="City">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((item) => (
                <SelectItem key={item.city} value={item.city}>
                  {item.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Button
        variant="outline"
        className="mt-4 min-h-11"
        onClick={useGps}
        disabled={busy || locating}
      >
        {locating ? (
          <Leaf className="animate-spin" aria-hidden="true" />
        ) : (
          <Droplet aria-hidden="true" />
        )}{" "}
        Detect my location
      </Button>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
