/*
 * iamkhayyam.xyz — GitHub contribution grid
 * Fetches fresh contribution data via github-contributions-api.jogruber.de
 * (scrapes GitHub on request, no aggressive caching). Renders the 53×7
 * calendar into #ghGrid using .cell / .cell.l1..l4 for monochrome levels.
 *
 * Because we render from JSON, this reflects whatever the public profile
 * shows — including private contributions when the "Include private
 * contributions on my profile" setting is enabled.
 */
(async function () {
  var grid = document.getElementById('ghGrid');
  var totalEl = document.getElementById('ghTotal');
  if (!grid) return;

  var username = grid.getAttribute('data-username') || 'iamkhayyam';

  try {
    var res = await fetch(
      'https://github-contributions-api.jogruber.de/v4/' + username + '?y=last',
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error('http ' + res.status);
    var data = await res.json();
    var contributions = data.contributions || [];
    var totalLast =
      (data.total && (data.total.lastYear || data.total[Object.keys(data.total).pop()])) ||
      contributions.reduce(function (a, d) { return a + (d.count || 0); }, 0);

    if (totalEl) totalEl.textContent = totalLast.toLocaleString();

    // Take the trailing 371 days so the grid aligns to full weeks.
    // Then chunk into 53 columns × 7 rows in column-major order.
    var days = contributions.slice(-371);
    var html = days
      .map(function (d, i) {
        var lvl = d.level || 0;
        var cls = 'cell' + (lvl ? ' l' + lvl : '');
        var title = d.date + ': ' + (d.count || 0) + ' contribution' + (d.count === 1 ? '' : 's');
        // Stagger: pop in week by week (column-major), then a diagonal
        // glint sweeps through after the wave lands.
        var col = Math.floor(i / 7);
        var row = i % 7;
        var pop = col * 14;
        var glint = 1100 + (col + row) * 9;
        return '<span class="' + cls + '" title="' + title + '" style="--d:' + pop + 'ms;--s:' + glint + 'ms"></span>';
      })
      .join('');
    grid.innerHTML = html;

    // Month labels across the top, aligned to the week column where each
    // month begins. Year marked on the first label and every January.
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var labels = [];
    var prevMonth = -1;
    var lastLabelCol = -3;
    for (var c = 0; c < 53; c++) {
      var d0 = days[c * 7];
      if (!d0) break;
      var dt = new Date(d0.date + 'T00:00:00');
      var m = dt.getMonth();
      if (m !== prevMonth && c - lastLabelCol >= 2) {
        var text = MONTHS[m];
        if (labels.length === 0 || m === 0) {
          text += ' ’' + String(dt.getFullYear()).slice(-2);
        }
        labels.push('<span style="grid-column: ' + (c + 1) + ' / span ' + Math.min(5, 53 - c) + '">' + text + '</span>');
        lastLabelCol = c;
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

    // On narrow viewports the grid overflows horizontally — land on the
    // most recent weeks (right edge), not July of last year.
    var wrap = grid.closest('.gh-chart-wrap') || grid.parentElement;
    if (wrap && wrap.scrollWidth > wrap.clientWidth) {
      wrap.scrollLeft = wrap.scrollWidth - wrap.clientWidth;
    }
  } catch (err) {
    grid.outerHTML =
      '<div style="text-align:center;padding:24px 0;font-family:var(--font-mono);font-size:12px;color:var(--muted-fg);">' +
      'Contribution graph unavailable — <a href="https://github.com/' + username + '">see github.com/' + username + '</a>' +
      '</div>';
  }
})();
