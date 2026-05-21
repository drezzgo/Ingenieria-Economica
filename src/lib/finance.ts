/**
 * Estructura que representa cada fila en una tabla de amortización.
 */
export interface AmortizationPeriod {
  period: number;          // Número de período (mes)
  beginningBalance: number; // Saldo inicial del período
  payment: number;          // Cuota total a pagar (Abono a capital + Interés)
  interest: number;         // Interés generado en el período
  principal: number;        // Abono neto a capital
  endingBalance: number;    // Saldo final después del pago
}

/**
 * Convierte una tasa nominal anual (j) con composición de períodos en el año a tasa efectiva para ese mismo período.
 * Fórmula: i = (1 + j/n)^n - 1
 * 
 * @param nominalRate Tasa nominal anual (por ejemplo, 0.24 para 24%)
 * @param periodsPerYear Número de períodos de capitalización al año (por ejemplo, 12 para capitalización mensual)
 * @returns Tasa efectiva anual correspondiente
 */
export function nominalToEffective(nominalRate: number, periodsPerYear: number): number {
  if (periodsPerYear <= 0) {
    throw new Error("El número de períodos por año debe ser mayor a 0");
  }
  return Math.pow(1 + nominalRate / periodsPerYear, periodsPerYear) - 1;
}

/**
 * Convierte una tasa efectiva anual (i) a tasa nominal anual (j) capitalizable n veces al año.
 * Fórmula: j = n * ((1 + i)^(1/n) - 1)
 * 
 * @param effectiveRate Tasa efectiva anual (por ejemplo, 0.2682 para 26.82%)
 * @param periodsPerYear Número de períodos de capitalización al año (por ejemplo, 12 para mensual)
 * @returns Tasa nominal anual correspondiente
 */
export function effectiveToNominal(effectiveRate: number, periodsPerYear: number): number {
  if (periodsPerYear <= 0) {
    throw new Error("El número de períodos por año debe ser mayor a 0");
  }
  if (effectiveRate <= -1) {
    throw new Error("La tasa efectiva debe ser mayor a -1 (-100%)");
  }
  return periodsPerYear * (Math.pow(1 + effectiveRate, 1 / periodsPerYear) - 1);
}

/**
 * Convierte una tasa de interés Vencida (iv) a tasa Anticipada (ia).
 * Fórmula: ia = iv / (1 + iv)
 * 
 * @param arrearsRate Tasa vencida del período (por ejemplo, 0.02 para 2% mensual vencido)
 * @returns Tasa anticipada del período
 */
export function arrearsToAdvance(arrearsRate: number): number {
  if (arrearsRate <= -1) {
    throw new Error("La tasa vencida debe ser mayor a -1 (-100%)");
  }
  return arrearsRate / (1 + arrearsRate);
}

/**
 * Convierte una tasa de interés Anticipada (ia) a tasa Vencida (iv).
 * Fórmula: iv = ia / (1 - ia)
 * 
 * @param advanceRate Tasa anticipada del período (por ejemplo, 0.0196 para 1.96% mensual anticipado)
 * @returns Tasa vencida del período
 */
export function advanceToArrears(advanceRate: number): number {
  if (advanceRate >= 1) {
    throw new Error("La tasa anticipada debe ser estrictamente menor a 1 (100%)");
  }
  return advanceRate / (1 - advanceRate);
}

/**
 * Calcula la tabla de amortización por el método Francés (Cuota Fija).
 * Fórmula de la cuota: A = P * [r * (1 + r)^N] / [(1 + r)^N - 1]
 * 
 * @param principal Monto total del crédito (Capital inicial)
 * @param periodicRate Tasa de interés periódica (del período de amortización, por ejemplo mensual)
 * @param periods Cantidad total de períodos (meses)
 * @returns Arreglo de períodos con el desglose de amortización
 */
export function calculateFrenchAmortization(
  principal: number,
  periodicRate: number,
  periods: number
): AmortizationPeriod[] {
  if (principal <= 0 || periods <= 0) {
    return [];
  }

  const schedule: AmortizationPeriod[] = [];
  let balance = principal;

  // Si la tasa es 0%, la cuota es simplemente capital repartido por igual
  const payment = periodicRate === 0
    ? principal / periods
    : (principal * periodicRate * Math.pow(1 + periodicRate, periods)) / (Math.pow(1 + periodicRate, periods) - 1);

  for (let t = 1; t <= periods; t++) {
    const interest = balance * periodicRate;
    const principalPaid = periodicRate === 0 ? payment : payment - interest;
    const endingBalance = Math.max(0, balance - principalPaid);

    schedule.push({
      period: t,
      beginningBalance: balance,
      payment: payment,
      interest: interest,
      principal: principalPaid,
      endingBalance: endingBalance
    });

    balance = endingBalance;
  }

  return schedule;
}

/**
 * Calcula la tabla de amortización por el método Alemán (Abono Constante a Capital).
 * Fórmula de amortización constante: C = P / N
 * Fórmula de la cuota en el período t: A_t = C + (Saldo_anterior * r)
 * 
 * @param principal Monto total del crédito (Capital inicial)
 * @param periodicRate Tasa de interés periódica (del período de amortización, por ejemplo mensual)
 * @param periods Cantidad total de períodos (meses)
 * @returns Arreglo de períodos con el desglose de amortización
 */
export function calculateGermanAmortization(
  principal: number,
  periodicRate: number,
  periods: number
): AmortizationPeriod[] {
  if (principal <= 0 || periods <= 0) {
    return [];
  }

  const schedule: AmortizationPeriod[] = [];
  let balance = principal;
  const principalPaid = principal / periods;

  for (let t = 1; t <= periods; t++) {
    const interest = balance * periodicRate;
    const payment = principalPaid + interest;
    const endingBalance = Math.max(0, balance - principalPaid);

    schedule.push({
      period: t,
      beginningBalance: balance,
      payment: payment,
      interest: interest,
      principal: principalPaid,
      endingBalance: endingBalance
    });

    balance = endingBalance;
  }

  return schedule;
}
