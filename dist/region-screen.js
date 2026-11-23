function regionPage(user) {
  return `<div class="region-screen">
    <header class="region-hero">
      <div class="region-hero-media" aria-hidden="true">
        <video id="regionVideo" muted loop playsinline preload="none" poster="assets/bashkortostan-region.webp" data-src="assets/bashkortostan-region.mp4"></video>
      </div>
      <div class="region-hero-shade" aria-hidden="true"></div>
      <div class="region-hero-content">
        ${visitBookToolbar()}
        <div class="region-title">
          <p>Южный Урал · Предуралье</p>
          <h1>Башкортостан</h1>
        </div>
        <button class="region-video-toggle fs-video-toggle" type="button" aria-label="Приостановить фоновое видео" hidden><span aria-hidden="true"></span></button>
      </div>
    </header>
    ${visitBookPage(user, 'bashkortostan', undefined, true)}
  </div>`;
}
