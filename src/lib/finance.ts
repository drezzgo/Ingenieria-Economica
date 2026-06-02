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
 * Estructura que representa cada período en una simulación de capitalización (ahorro/crecimiento).
 */
export interface CapitalizationPeriod {
  period: number;          // Número de período
  beginningBalance: number; // Saldo inicial
  deposit: number;          // Depósito periódico efectuado en el período
  interest: number;         // Interés ganado en el período
  endingBalance: number;    // Saldo final acumulado
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
    let principalPaid = periodicRate === 0 ? payment : payment - interest;
    let currentPayment = payment;

    // Ajuste en la última cuota o si por redondeo se paga más del saldo
    if (t === periods || principalPaid > balance) {
      principalPaid = balance;
      currentPayment = principalPaid + interest;
    }

    const endingBalance = balance - principalPaid;

    schedule.push({
      period: t,
      beginningBalance: balance,
      payment: currentPayment,
      interest: interest,
      principal: principalPaid,
      endingBalance: Math.abs(endingBalance) < 1e-10 ? 0 : endingBalance
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
    let actualPrincipalPaid = principalPaid;
    
    // Ajuste en la última cuota o si el abono supera el saldo por precisión
    if (t === periods || actualPrincipalPaid > balance) {
      actualPrincipalPaid = balance;
    }

    const payment = actualPrincipalPaid + interest;
    const endingBalance = balance - actualPrincipalPaid;

    schedule.push({
      period: t,
      beginningBalance: balance,
      payment: payment,
      interest: interest,
      principal: actualPrincipalPaid,
      endingBalance: Math.abs(endingBalance) < 1e-10 ? 0 : endingBalance
    });

    balance = endingBalance;
  }

  return schedule;
}

/**
 * Simulación de capitalización de un monto inicial fijo (Interés Compuesto clásico).
 * Fórmula: S_t = S_{t-1} * (1 + r)
 * 
 * @param principal Depósito inicial único
 * @param periodicRate Tasa de interés periódica de crecimiento (por ejemplo, rendimiento mensual)
 * @param periods Número total de períodos
 * @returns Tabla de acumulación del ahorro
 */
export function calculateCompoundCapitalization(
  principal: number,
  periodicRate: number,
  periods: number
): CapitalizationPeriod[] {
  if (principal <= 0 || periods <= 0) {
    return [];
  }
  const schedule: CapitalizationPeriod[] = [];
  let balance = principal;

  for (let t = 1; t <= periods; t++) {
    const interest = balance * periodicRate;
    const endingBalance = balance + interest;
    schedule.push({
      period: t,
      beginningBalance: balance,
      deposit: 0, // El depósito inicial se hizo en t=0, por lo que en t>=1 es 0
      interest: interest,
      endingBalance: endingBalance
    });
    balance = endingBalance;
  }
  return schedule;
}

/**
 * Simulación de capitalización con depósitos periódicos constantes (Serie Uniforme de Capitalización / Anualidad de ahorro).
 * En este caso ordinario: en cada mes se inicia con el saldo anterior, se genera interés, y al final se suma el depósito.
 * Fórmula del período t: S_t = S_{t-1} * (1 + r) + R
 * 
 * @param deposit Depósito constante periódico (ahorro mensual)
 * @param periodicRate Tasa de interés periódica de crecimiento (rendimiento mensual)
 * @param periods Número total de períodos
 * @returns Tabla de acumulación de ahorro estructurada
 */
export function calculateAnnuityCapitalization(
  deposit: number,
  periodicRate: number,
  periods: number
): CapitalizationPeriod[] {
  if (deposit <= 0 || periods <= 0) {
    return [];
  }
  const schedule: CapitalizationPeriod[] = [];
  let balance = 0;

  for (let t = 1; t <= periods; t++) {
    const beginningBalance = balance;
    const interest = beginningBalance * periodicRate;
    const endingBalance = beginningBalance + interest + deposit;
    schedule.push({
      period: t,
      beginningBalance: beginningBalance,
      deposit: deposit,
      interest: interest,
      endingBalance: endingBalance
    });
    balance = endingBalance;
  }
  return schedule;
}
