export function animateToCart(source) {
  const image = source?.closest(".product-card, .festival-product-card, .product-detail-card")?.querySelector("img");
  const cart = document.querySelector("[data-cart-link]");
  if (!image || !cart || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.dispatchEvent(new CustomEvent("clayora:cart-added"));
    return;
  }
  const from = image.getBoundingClientRect();
  const to = cart.getBoundingClientRect();
  const flyer = image.cloneNode();
  flyer.className = "cart-flyer";
  Object.assign(flyer.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${Math.min(from.width, 90)}px`, height: `${Math.min(from.height, 90)}px` });
  document.body.appendChild(flyer);
  requestAnimationFrame(() => Object.assign(flyer.style, { transform: `translate3d(${to.left - from.left}px,${to.top - from.top}px,0) scale(.12) rotate(14deg)`, opacity: "0.15" }));
  setTimeout(() => { flyer.remove(); window.dispatchEvent(new CustomEvent("clayora:cart-added")); }, 720);
}
