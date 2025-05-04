import siteReport from "#entities/google/siteReport/index.js";
import { delay } from "#utils/index.js";
import { DateTime } from "luxon";

/**
 * @typedef {{value: string; label: string; selected: boolean;}} SelectOption
 */

export const DATE_FORMAT = "yyyy-MM-dd";

/**
 * @param {GetCtx<T.GoogleSiteAnalyticsUrlQuery>} ctx
 */
export async function googleSiteAnalytics(ctx) {
  const { viewType, weeks, years, months, startDate, endDate } =
    getFiltersFromCtx(ctx);

  await ctx.render(ctx.URL.pathname.substring(1), {
    viewType,
    weeks,
    years,
    months,
    startDate: startDate.toFormat(DATE_FORMAT),
    endDate: endDate.toFormat(DATE_FORMAT),
  });
}

/**
 * @param {GetCtx<T.GoogleSiteAnalyticsUrlQuery>} ctx
 */
export async function rows(ctx) {
  const {
    periodLabel,
    viewType,
    startDate,
    endDate,
    weeks,
    years,
    months,
    selectedWeek,
    selectedYear,
    selectedMonth,
  } = getFiltersFromCtx(ctx);
  const analytics = await siteReport.getAnalytics({ startDate, endDate });

  const historyUrl = new URL(ctx.get("Hx-Current-Url"));

  historyUrl.searchParams.set("year", String(selectedYear));

  if (viewType === "week") {
    historyUrl.searchParams.set("week", String(selectedWeek));
    historyUrl.searchParams.delete("month");
  } else if (viewType === "month") {
    historyUrl.searchParams.set("month", String(selectedMonth));
    historyUrl.searchParams.delete("week");
  } else if (viewType === "custom") {
    historyUrl.searchParams.set("startDate", startDate.toFormat(DATE_FORMAT));
    historyUrl.searchParams.set("endDate", endDate.toFormat(DATE_FORMAT));
    historyUrl.searchParams.delete("week");
    historyUrl.searchParams.delete("month");
    historyUrl.searchParams.delete("year");
  }

  historyUrl.searchParams.set("viewType", viewType);

  ctx.hxReplaceUrl(historyUrl.toString());

  await delay(400);

  await ctx.render(ctx.URL.pathname.substring(1), {
    viewType,
    weeks,
    years,
    months,
    periodLabel,
    analytics,
    startDate: startDate.toFormat(DATE_FORMAT),
    endDate: endDate.toFormat(DATE_FORMAT),
  });
}

/**
 * @param {GetCtx<T.GoogleSiteAnalyticsUrlQuery>} ctx
 */
function getFiltersFromCtx(ctx) {
  const { query } = ctx;
  const viewType =
    query.viewType === "month" ||
    query.viewType === "week" ||
    query.viewType === "custom"
      ? query.viewType
      : "month";
  const [startDate, endDate] = getDates(query, viewType);
  const periodLabel = getPeriodLabel(startDate, endDate);

  const [weeks, selectedWeek] = getWeeks(query.week, query.year);
  const [months, selectedMonth] = getMonths(query.month, query.year);
  const [years, selectedYear] = getYears(query.year);

  return {
    startDate,
    endDate,
    periodLabel,
    viewType,
    weeks,
    years,
    months,
    selectedWeek,
    selectedMonth,
    selectedYear,
  };
}

/**
 * @param {GetCtx<T.GoogleSiteAnalyticsUrlQuery>['query']} query
 * @param {'month' | 'week' | 'custom'} viewType
 * @returns {[DateTime<true>, DateTime<true>]}
 */
function getDates(query, viewType) {
  if (viewType === "custom") return getCustomDates(query);

  /** @type {[DateTime<true>, DateTime<true>]} */
  const defaultRange = [
    DateTime.now().startOf(viewType),
    DateTime.now().endOf(viewType),
  ];

  if (viewType === "week" && (!query.year || !query.week)) return defaultRange;

  if (viewType === "month" && (!query.year || !query.month))
    return defaultRange;

  let start, end;
  if (viewType === "month") {
    start = DateTime.fromObject({
      year: Number(query.year),
      month: Number(query.month),
    }).startOf("month");
    end = start.endOf("month");
  } else if (viewType === "week") {
    start = DateTime.fromObject({
      weekYear: Number(query.year),
      weekNumber: Number(query.week),
    }).startOf("week");
    end = start.endOf("week");
  }

  if (!start?.isValid || !end?.isValid) return defaultRange;

  const isEndValid = DateTime.fromISO(start.toISODate())
    .endOf(viewType)
    .equals(end);
  const isStartValid = DateTime.fromISO(end.toISODate())
    .startOf(viewType)
    .equals(start);

  return isEndValid && isStartValid ? [start, end] : defaultRange;
}

/**
 * @param {GetCtx<T.GoogleSiteAnalyticsUrlQuery>['query']} query
 * @returns {[DateTime<true>, DateTime<true>]}
 */
function getCustomDates(query) {
  const now = DateTime.now();
  let selectedStartDate = DateTime.fromFormat(
    query.startDate ?? "",
    DATE_FORMAT,
  );
  let selectedEndDate = DateTime.fromFormat(query.endDate ?? "", DATE_FORMAT);

  if (!selectedStartDate.isValid) selectedStartDate = now;
  if (!selectedEndDate.isValid) selectedEndDate = now;

  if (selectedStartDate > selectedEndDate)
    return [selectedEndDate, selectedEndDate];

  if (selectedEndDate < selectedStartDate)
    return [selectedStartDate, selectedStartDate];

  return [selectedStartDate, selectedEndDate];
}

/**
 * @param {DateTime} startDate
 * @param {DateTime} endDate
 */
function getPeriodLabel(startDate, endDate) {
  const start = startDate
    .setLocale("ru")
    .toLocaleString({ month: "short", year: "2-digit" });
  const end = endDate
    .setLocale("ru")
    .toLocaleString({ month: "short", year: "2-digit" });

  return `${start} - ${end}`;
}

/**
 * @param {string | undefined} queryWeek
 * @param {string | undefined} queryYear
 * @returns {[SelectOption[], number]}
 */
function getWeeks(queryWeek, queryYear) {
  const WEEKS_IN_YEAR = 52;
  const now = DateTime.now();
  const selectedWeek = queryWeek ? Number(queryWeek) : now.weekNumber;
  const selectedYear = queryYear ? Number(queryYear) : now.weekYear;

  /** @type {{label: string; value: string; selected: boolean;}[]} */
  const weeks = [];

  let currWeekNumber =
    selectedYear === now.year ? now.weekNumber : WEEKS_IN_YEAR;

  while (currWeekNumber > 0) {
    const weekDate = DateTime.fromObject({
      weekYear: selectedYear,
      weekNumber: currWeekNumber,
    });

    const dateStart = weekDate
      .startOf("week")
      .setLocale("ru")
      .toLocaleString({ day: "2-digit", month: "short" });
    const dateEnd = weekDate
      .endOf("week")
      .setLocale("ru")
      .toLocaleString({ day: "2-digit", month: "short" });

    weeks.push({
      label: `${dateStart} - ${dateEnd}`,
      value: String(currWeekNumber),
      selected: currWeekNumber === selectedWeek,
    });

    currWeekNumber--;
  }

  return [weeks, selectedWeek];
}

/**
 * @param {string | undefined} queryMonth
 * @param {string | undefined} queryYear
 * @returns {[SelectOption[], number]}
 */
function getMonths(queryMonth, queryYear) {
  const now = DateTime.now();
  const selectedMonth = queryMonth ? Number(queryMonth) : now.month;
  const selectedYear = queryYear ? Number(queryYear) : now.year;

  const isCurrentYear = selectedYear === now.year;
  const months = Array(isCurrentYear ? now.month : 12)
    .fill(null)
    .map((_v, i) => {
      const month = i + 1;
      return {
        selected: selectedMonth === month,
        label: DateTime.fromObject({ month })
          .setLocale("ru")
          .toLocaleString({ month: "short" }),
        value: String(month),
      };
    });

  return [months, selectedMonth];
}

/**
 * @param {string | undefined} queryYear
 * @returns {[SelectOption[], number]}
 */
function getYears(queryYear) {
  const now = DateTime.now();
  const year = queryYear ? Number(queryYear) : now.year;

  const years = Array(11)
    .fill(null)
    .map((_v, i) => {
      const nextYearDate = now.minus({ year: i });

      return {
        value: String(nextYearDate.year),
        label: nextYearDate.setLocale("ru").toLocaleString({ year: "numeric" }),
        selected: year === nextYearDate.year,
      };
    });

  return [years, year];
}
