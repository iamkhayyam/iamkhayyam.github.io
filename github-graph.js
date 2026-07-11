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
      .map(function (d) {
        var lvl = d.level || 0;
        var cls = 'cell' + (lvl ? ' l' + lvl : '');
        var title = d.date + ': ' + (d.count || 0) + ' contribution' + (d.count === 1 ? '' : 's');
        return '<span class="' + cls + '" title="' + title + '"></span>';
      })
      .join('');
    grid.innerHTML = html;
  } catch (err) {
    grid.outerHTML =
      '<div style="text-align:center;padding:24px 0;font-family:var(--font-mono);font-size:12px;color:var(--muted-fg);">' +
      'Contribution graph unavailable — <a href="https://github.com/' + username + '">see github.com/' + username + '</a>' +
      '</div>';
  }
})();
