/*
 * iamkhayyam.xyz — GitHub contribution grid (multi-account)
 * Fetches all accounts in parallel via github-contributions-api.jogruber.de,
 * merges by date (summing counts), recalculates levels from the combined
 * distribution, then renders the 53×7 calendar with the same pop-in animation.
 */
(async function () {
  var grid = document.getElementById('ghGrid');
  var totalEl = document.getElementById('ghTotal');
  if (!grid) return;

  var attr = grid.getAttribute('data-usernames') || grid.getAttribute('data-username') || 'iamkhayyam';
  var usernames = attr.split(',').map(function (u) { return u.trim(); }).filter(Boolean);
  var API = 'https://github-contributions-api.jogruber.de/v4/';

  try {
    // Fetch all accounts in parallel
    var responses = await Promise.all(
      usernames.map(function (u) {
        return fetch(API + u + '?y=last', { cache: 'no-store' })
          .then(function (r) { return r.ok ? r.json() : { contributions: [] }; })
          .catch(function () { return { contributions: [] }; });
      })
    );

    // Merge by date — sum counts across all accounts
    var byDate = {};
    responses.forEach(function (data) {
      (data.contributions || []).forEach(function (d) {
        if (!byDate[d.date]) byDate[d.date] = 0;
        byDate[d.date] += (d.count || 0);
      });
    });

    // Anchor to today, take trailing 365 days
    var t = new Date();
    var todayStr = t.getFullYear() + '-' +
      String(t.getMonth() + 1).padStart(2, '0') + '-' +
      String(t.getDate()).padStart(2, '0');

    // Collect all dates in sorted order, filter to <= today, last 365
    var allDates = Object.keys(byDate).sort();
    var days = allDates
      .filter(function (d) { return d <= todayStr; })
      .slice(-365)
      .map(function (date) { return { date: date, count: byDate[date] }; });

    // Recalculate levels from combined distribution (quartiles of non-zero days)
    var nonZero = days.map(function (d) { return d.count; }).filter(function (c) { return c > 0; }).sort(function (a, b) { return a - b; });
    var q1 = nonZero[Math.floor(nonZero.length * 0.25)] || 1;
    var q2 = nonZero[Math.floor(nonZero.length * 0.50)] || 2;
    var q3 = nonZero[Math.floor(nonZero.length * 0.75)] || 4;
    function level(count) {
      if (!count) return 0;
      if (count <= q1) return 1;
      if (count <= q2) return 2;
      if (count <= q3) return 3;
      return 4;
    }

    var total = days.reduce(function (a, d) { return a + d.count; }, 0);
    if (totalEl) totalEl.textContent = total.toLocaleString();

    var html = days
      .map(function (d, i) {
        var lvl = level(d.count);
        var cls = 'cell' + (lvl ? ' l' + lvl : '');
        var title = d.date + ': ' + d.count + ' contribution' + (d.count === 1 ? '' : 's');
        var col = Math.floor(i / 7);
        var row = i % 7;
        var pop = col * 14;
        var glint = 1100 + (col + row) * 9;
        return '<span class="' + cls + '" title="' + title + '" style="--d:' + pop + 'ms;--s:' + glint + 'ms"></span>';
      })
      .join('');
    grid.innerHTML = html;

    // Month labels
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var labels = [];
    var years = [];
    var prevMonth = -1;
    var prevYear = -1;
    var lastLabelCol = -3;
    for (var c = 0; c < 53; c++) {
      var d0 = days[c * 7];
      if (!d0) break;
      var dt = new Date(d0.date + 'T00:00:00');
      var m = dt.getMonth();
      var y = dt.getFullYear();
      if (m !== prevMonth && c - lastLabelCol >= 2) {
        labels.push('<span style="grid-column: ' + (c + 1) + ' / span ' + Math.min(5, 53 - c) + '">' + MONTHS[m] + '</span>');
        lastLabelCol = c;
      }
      if (y !== prevYear) {
        years.push('<span style="grid-column: ' + (c + 1) + ' / span ' + Math.min(6, 53 - c) + '">' + y + '</span>');
        prevYear = y;
      }
      prevMonth = m;
    }

    var prevMonths = grid.parentNode.querySelector('.gh-months');
    if (prevMonths) prevMonths.remove();
    var monthsEl = document.createElement('div');
    monthsEl.className = 'gh-months';
    monthsEl.setAttribute('aria-hidden', 'true');
    monthsEl.innerHTML = labels.join('');
    grid.parentNode.insertBefore(monthsEl, grid);

    var prevYears = grid.parentNode.querySelector('.gh-years');
    if (prevYears) prevYears.remove();
    var yearsEl = document.createElement('div');
    yearsEl.className = 'gh-years';
    yearsEl.setAttribute('aria-hidden', 'true');
    yearsEl.innerHTML = years.join('');
    grid.parentNode.insertBefore(yearsEl, grid.nextSibling);

    var wrap = grid.closest('.gh-chart-wrap') || grid.parentElement;
    if (wrap && wrap.scrollWidth > wrap.clientWidth) {
      wrap.scrollLeft = wrap.scrollWidth - wrap.clientWidth;
    }
  } catch (err) {
    grid.outerHTML =
      '<div style="text-align:center;padding:24px 0;font-family:var(--font-mono);font-size:12px;color:var(--muted-fg);">' +
      'Contribution graph unavailable — <a href="https://github.com/iamkhayyam">see GitHub</a>' +
      '</div>';
  }
})();
