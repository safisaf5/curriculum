/*
 * Runs before first paint (loaded synchronously in <head>):
 *  - flags <html class="js"> so scroll reveals only hide content when JS runs;
 *  - applies the saved theme, or the system preference, without a flash;
 *  - sends returning visitors who chose English from "/" to "/en".
 * External file (not inline) so the Content-Security-Policy can stay strict.
 */
(function () {
  var d = document.documentElement;
  d.classList.add('js');
  try {
    var saved = localStorage.getItem('theme');
    var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    d.classList.toggle('dark', dark);
    d.style.colorScheme = dark ? 'dark' : 'light';

    var lang = localStorage.getItem('language');
    var sameSite = document.referrer && document.referrer.indexOf(location.origin) === 0;
    if (lang === 'en' && location.pathname === '/' && !sameSite && !location.hash) {
      location.replace('/en' + location.search);
    }
  } catch (e) {
    /* storage unavailable: keep defaults */
  }
})();
