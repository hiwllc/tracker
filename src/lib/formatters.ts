export const currency = (value: number) => {
  const intl = new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  });

  return intl.format(value / 100);
};

export const number = (value: string) => {
  return Number(value.replace(/\D+/g, ""));
};
