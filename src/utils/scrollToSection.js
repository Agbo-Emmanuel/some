export const scrollToSection = (id) => {
  const target = document.getElementById(id);
  if (!target) return;

  const header = document.querySelector("header");
  const headerOffset = header ? header.offsetHeight : 0;
  const extraGap = 16; // small breathing room below the sticky header

  const top =
    target.getBoundingClientRect().top +
    window.pageYOffset -
    headerOffset -
    extraGap;

  window.scrollTo({ top, behavior: "smooth" });
};
