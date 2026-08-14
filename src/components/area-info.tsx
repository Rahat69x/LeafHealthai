import { useEffect, useMemo, useState } from "react";
import { Leaf } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { riskTone } from "@/components/weather-card";
import {
  AREAS,
  COUNTRIES,
  citiesOf,
  districtsOf,
  divisionsOf,
  findArea,
  type Area,
} from "@/lib/regions";
import { getWeatherReport, seasonOf, SEASON_NOTES, type WeatherReport } from "@/lib/weather";

export function AreaInfo({
  onArea,
}: {
  onArea?: (area: Area, report: WeatherReport | null) => void;
}) {
  const [country, setCountry] = useState(AREAS[0]!.country);
  const [division, setDivision] = useState(AREAS[0]!.division);
  const [district, setDistrict] = useState(AREAS[0]!.district);
  const [city, setCity] = useState(AREAS[0]!.city);
  const [report, setReport] = useState<WeatherReport | null>(null);
  const [loading, setLoading] = useState(false);

  const divisions = useMemo(() => divisionsOf(country), [country]);
  const districts = useMemo(() => districtsOf(country, division), [country, division]);
  const cities = useMemo(
    () => citiesOf(country, division, district),
    [country, division, district],
  );
  const area = findArea(country, division, district, city) ?? AREAS[0]!;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setReport(null);
    getWeatherReport({
      name: area.city,
      country: area.country,
      latitude: area.latitude,
      longitude: area.longitude,
    })
      .then((next) => {
        if (cancelled) return;
        setReport(next);
        onArea?.(area, next);
      })
      .catch(() => {
        if (!cancelled) onArea?.(area, null);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area.city, area.country]);

  function pickCountry(value: string) {
    const nextDivision = divisionsOf(value)[0]!;
    const nextDistrict = districtsOf(value, nextDivision)[0]!;
    setCountry(value);
    setDivision(nextDivision);
    setDistrict(nextDistrict);
    setCity(citiesOf(value, nextDivision, nextDistrict)[0]!);
  }

  function pickDivision(value: string) {
    const nextDistrict = districtsOf(country, value)[0]!;
    setDivision(value);
    setDistrict(nextDistrict);
    setCity(citiesOf(country, value, nextDistrict)[0]!);
  }

  function pickDistrict(value: string) {
    setDistrict(value);
    setCity(citiesOf(country, division, value)[0]!);
  }

  const season = seasonOf(new Date(), area.latitude);

  const selects = [
    { label: "Country", value: country, options: COUNTRIES, onChange: pickCountry },
    { label: "Division / State", value: division, options: divisions, onChange: pickDivision },
    { label: "District", value: district, options: districts, onChange: pickDistrict },
    { label: "City", value: city, options: cities, onChange: setCity },
  ];

  return (
    <section
      className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7"
      aria-labelledby="area-heading"
    >
      <h2 id="area-heading" className="text-lg font-bold text-foreground">
        Disease information by area
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose your area to see the common diseases, today's weather and the best prevention tips.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {selects.map((item) => (
          <label
            key={item.label}
            className="grid gap-1.5 text-xs font-medium text-muted-foreground"
          >
            {item.label}
            <Select value={item.value} onValueChange={item.onChange}>
              <SelectTrigger className="min-h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {item.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Area" value={area.city} />
        <Stat
          label="Current weather"
          value={report ? `${report.now.temperature}°C` : loading ? "…" : "No data"}
        />
        <Stat
          label="Humidity"
          value={report ? `${report.now.humidity}%` : loading ? "…" : "No data"}
        />
        <Stat label="Most common disease" value={area.commonDiseases[0] ?? "None"} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {loading && (
          <Leaf className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />
        )}
        {report && (
          <Badge variant="outline" className={`rounded-full ${riskTone[report.level]}`}>
            Risk level: {report.level}
          </Badge>
        )}
        <Badge variant="outline" className="rounded-full">
          {season} season
        </Badge>
      </div>

      {report && report.level !== "Low" && (
        <p className="mt-4 rounded-2xl border border-amber/50 bg-amber/10 p-3 text-sm text-foreground">
          Alert for {area.city}: {report.reason}
        </p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Block title="Common diseases here" items={area.commonDiseases} />
        <Block
          title="Seasonal risks"
          items={[...area.seasonalRisks, ...SEASON_NOTES[season].diseases.slice(0, 2)]}
        />
        <Block title="Best prevention tips" items={area.prevention} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border bg-muted/20 p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
