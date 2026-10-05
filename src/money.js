// Усі грошові суми зберігаються в копійках (цілі числа), в API — у гривнях.
export const toKop = (uah) => Math.round(uah * 100);
export const fromKop = (kop) => (kop == null ? null : Math.round(kop) / 100);
