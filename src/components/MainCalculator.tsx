import React, { useState, useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import {
  nominalToEffective,
  effectiveToNominal,
  arrearsToAdvance,
  advanceToArrears,
  calculateFrenchAmortization,
  calculateGermanAmortization,
  calculateCompoundCapitalization,
  calculateAnnuityCapitalization,
  type AmortizationPeriod,
  type CapitalizationPeriod
} from '../lib/finance';
import { RosenBarChart, RosenLineChart } from './Rosenchart';
import EducationalSection from './EducationalSection';

type Tab = 'tasas' | 'creditos' | 'capitalizacion' | 'educacion';

export default function MainCalculator() {
  const [activeTab, setActiveTab] = useState<Tab>('tasas');

  // BRANDING ANIMATION ON MOUNT
  const brandRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    animate('.brand-char', {
      translateY: [30, 0],
      opacity: [0, 1],
      delay: stagger(60),
      duration: 1000,
      ease: 'outElastic(1, 0.6)'
    });
  }, []);

  // TAB TRANSITION ANIMATION
  useEffect(() => {
    animate('.tab-content-wrapper', {
      opacity: [0, 1],
      translateY: [15, 0],
      duration: 400,
      ease: 'outCubic'
    });
  }, [activeTab]);

  // ==========================================
  // ESTADOS - TAB 1: CONVERSIÓN DE TASAS
  // ==========================================
  const [jRate, setJRate] = useState<number>(0.24); // Nominal Anual (j)
  const [mPeriods, setMPeriods] = useState<number>(12); // Capitalizaciones/año
  const [iResult, setIResult] = useState<number>(0);
  
  const [iRateInput, setIRateInput] = useState<number>(0.26824); // Efectiva Anual (i)
  const [jResult, setJResult] = useState<number>(0);

  const [ivRate, setIvRate] = useState<number>(0.02); // Periódica Vencida
  const [iaResult, setIaResult] = useState<number>(0);

  const [iaRate, setIaRate] = useState<number>(0.0196); // Periódica Anticipada
  const [ivResult, setIvResult] = useState<number>(0);

  // Efecto para calcular tasas en tiempo real
  useEffect(() => {
    try {
      setIResult(nominalToEffective(jRate, mPeriods));
    } catch {
      setIResult(0);
    }
  }, [jRate, mPeriods]);

  useEffect(() => {
    try {
      setJResult(effectiveToNominal(iRateInput, mPeriods));
    } catch {
      setJResult(0);
    }
  }, [iRateInput, mPeriods]);

  useEffect(() => {
    try {
      setIaResult(arrearsToAdvance(ivRate));
    } catch {
      setIaResult(0);
    }
  }, [ivRate]);

  useEffect(() => {
    try {
      setIvResult(advanceToArrears(iaRate));
    } catch {
      setIvResult(0);
    }
  }, [iaRate]);

  // ==========================================
  // ESTADOS - TAB 2: AMORTIZACIÓN (CRÉDITOS)
  // ==========================================
  const [loanAmount, setLoanAmount] = useState<number>(12000);
  const [loanRate, setLoanRate] = useState<number>(0.018); // Tasa periódica mensual
  const [loanPeriods, setLoanPeriods] = useState<number>(12); // meses

  const [frenchSchedule, setFrenchSchedule] = useState<AmortizationPeriod[]>([]);
  const [germanSchedule, setGermanSchedule] = useState<AmortizationPeriod[]>([]);

  useEffect(() => {
    setFrenchSchedule(calculateFrenchAmortization(loanAmount, loanRate, loanPeriods));
    setGermanSchedule(calculateGermanAmortization(loanAmount, loanRate, loanPeriods));
  }, [loanAmount, loanRate, loanPeriods]);

  const totalFrenchInterest = frenchSchedule.reduce((sum, p) => sum + p.interest, 0);
  const totalGermanInterest = germanSchedule.reduce((sum, p) => sum + p.interest, 0);

  const maxTotalPaid = Math.max(loanAmount + totalFrenchInterest, loanAmount + totalGermanInterest);

  // ==========================================
  // ESTADOS - TAB 3: CAPITALIZACIÓN (AHORRO)
  // ==========================================
  const [capAmount, setCapAmount] = useState<number>(500); // Depósito periódico o inicial
  const [capRate, setCapRate] = useState<number>(0.01); // Rendimiento mensual (1%)
  const [capPeriods, setCapPeriods] = useState<number>(12); // Meses

  const [compoundSchedule, setCompoundSchedule] = useState<CapitalizationPeriod[]>([]);
  const [annuitySchedule, setAnnuitySchedule] = useState<CapitalizationPeriod[]>([]);

  useEffect(() => {
    setCompoundSchedule(calculateCompoundCapitalization(capAmount, capRate, capPeriods));
    setAnnuitySchedule(calculateAnnuityCapitalization(capAmount, capRate, capPeriods));
  }, [capAmount, capRate, capPeriods]);

  return (
    <div className="space-y-8">
      {/* BRANDING HEADER - EQUIX UD */}
      <div className="bg-white/40 backdrop-blur-md border border-neutral-100 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div ref={brandRef} className="space-y-2">
          {/* Animate Text Branding */}
          <div className="flex overflow-hidden">
            {Array.from("Equis UD").map((char, index) => {
              const isUD = char === 'U' || char === 'D';
              return (
                <span
                  key={index}
                  className={`brand-char text-3xl sm:text-4xl font-extrabold tracking-tight inline-block ${
                    isUD ? 'text-red-600' : 'text-neutral-900'
                  }`}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              );
            })}
          </div>
          <p className="text-neutral-500 text-sm font-medium">
            Plataforma de Ingeniería Económica · Facultad de Ingeniería
          </p>
        </div>

        {/* Dynamic Tab Navigation (Apple style pill list) */}
        <div className="flex bg-neutral-100/80 p-1.5 rounded-2xl border border-neutral-200/50 w-full md:w-auto overflow-x-auto">
          {(['tasas', 'creditos', 'capitalizacion', 'educacion'] as const).map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none py-2.5 px-4 rounded-xl text-xs font-semibold tracking-tight transition-all duration-350 cursor-pointer text-center capitalize ${
                  isSelected
                    ? 'bg-white text-red-700 shadow-sm border border-neutral-200/30 scale-[1.02]'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                {tab === 'tasas' && 'Conversión Tasas'}
                {tab === 'creditos' && 'Simulador Crédito'}
                {tab === 'capitalizacion' && 'Ahorro / Capitalización'}
                {tab === 'educacion' && 'Módulo Educativo'}
              </button>
            );
          })}
        </div>
      </div>

      {/* SPA DYNAMIC TAB WRAPPER */}
      <div className="tab-content-wrapper min-h-[480px]">
        
        {/* ======================================================= */}
        {/* TAB 1: CONVERSIÓN DE TASAS */}
        {/* ======================================================= */}
        {activeTab === 'tasas' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* CARD 1: Nominal Anual <-> Efectiva Anual */}
            <div className="bg-white/60 backdrop-blur-xl border border-neutral-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mb-1">
                    Equivalencia Financiera
                  </span>
                  <h3 className="text-xl font-bold text-neutral-950">
                    Tasas Nominales y Efectivas
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Relaciona la tasa de interés pactada nominal (j) con el impacto real efectiva anual (i).
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Nominal Input */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Tasa Nominal Anual (j): {(jRate * 100).toFixed(2)}%
                    </label>
                    <input
                      type="range"
                      min="0.01"
                      max="1.0"
                      step="0.01"
                      value={jRate}
                      onChange={(e) => setJRate(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                  </div>

                  {/* Compounding Input */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Frecuencia de Capitalización al Año (n): {mPeriods}
                    </label>
                    <select
                      value={mPeriods}
                      onChange={(e) => setMPeriods(parseInt(e.target.value))}
                      className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                    >
                      <option value={12}>12 (Mensual)</option>
                      <option value={6}>6 (Bimestral)</option>
                      <option value={4}>4 (Trimestral)</option>
                      <option value={2}>2 (Semestral)</option>
                      <option value={1}>1 (Anual)</option>
                      <option value={365}>365 (Diaria)</option>
                    </select>
                  </div>

                  {/* Effective Input */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Tasa Efectiva Anual (i): {(iRateInput * 100).toFixed(2)}%
                    </label>
                    <input
                      type="range"
                      min="0.01"
                      max="1.5"
                      step="0.01"
                      value={iRateInput}
                      onChange={(e) => setIRateInput(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Outputs Displays */}
              <div className="mt-8 pt-6 border-t border-neutral-100 grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-150">
                  <span className="text-[10px] text-neutral-500 font-bold block uppercase tracking-wide">
                    Efectiva Anual Calc
                  </span>
                  <span className="text-lg font-extrabold text-red-700 block mt-1">
                    {(iResult * 100).toFixed(4)}%
                  </span>
                </div>
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-150">
                  <span className="text-[10px] text-neutral-500 font-bold block uppercase tracking-wide">
                    Nominal Anual Calc
                  </span>
                  <span className="text-lg font-extrabold text-amber-600 block mt-1">
                    {(jResult * 100).toFixed(4)}%
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 2: Vencida <-> Anticipada */}
            <div className="bg-white/60 backdrop-blur-xl border border-neutral-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block mb-1">
                    Estructura de Vencimiento
                  </span>
                  <h3 className="text-xl font-bold text-neutral-950">
                    Tasas Vencidas y Anticipadas
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Calcula la equivalencia al cambiar el cobro de intereses del fin de mes al inicio de mes.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Arrears Input */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Tasa Periódica Vencida (iv): {(ivRate * 100).toFixed(2)}%
                    </label>
                    <input
                      type="range"
                      min="0.005"
                      max="0.2"
                      step="0.001"
                      value={ivRate}
                      onChange={(e) => setIvRate(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                  </div>

                  {/* Advance Input */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Tasa Periódica Anticipada (ia): {(iaRate * 100).toFixed(2)}%
                    </label>
                    <input
                      type="range"
                      min="0.005"
                      max="0.2"
                      step="0.001"
                      value={iaRate}
                      onChange={(e) => setIaRate(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Output Results */}
              <div className="mt-8 pt-6 border-t border-neutral-100 grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-150">
                  <span className="text-[10px] text-neutral-500 font-bold block uppercase tracking-wide">
                    Anticipada Equiv (ia)
                  </span>
                  <span className="text-lg font-extrabold text-red-700 block mt-1">
                    {(iaResult * 100).toFixed(4)}%
                  </span>
                </div>
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-150">
                  <span className="text-[10px] text-neutral-500 font-bold block uppercase tracking-wide">
                    Vencida Equiv (iv)
                  </span>
                  <span className="text-lg font-extrabold text-amber-600 block mt-1">
                    {(ivResult * 100).toFixed(4)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Educational Callout */}
            <div className="lg:col-span-2 bg-gradient-to-r from-red-600/5 to-amber-500/5 border border-red-500/10 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-red-700 block">🧑‍🏫 Tip del Profesor de Ingeniería Económica</span>
                <p className="text-xs text-neutral-600 max-w-2xl leading-relaxed">
                  "Recuerda que la tasa periódica anticipada siempre será nominalmente inferior a su tasa periódica vencida equivalente,
                  porque el cobro anticipado disminuye el valor neto del flujo efectivo."
                </p>
              </div>
              <button
                onClick={() => setActiveTab('educacion')}
                className="text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                Ver Explicación Completa
              </button>
            </div>

          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 2: SIMULADOR DE CRÉDITO */}
        {/* ======================================================= */}
        {activeTab === 'creditos' && (
          <div className="space-y-8">
            
            {/* Input Controls */}
            <div className="bg-white/60 backdrop-blur-xl border border-neutral-100 rounded-3xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Monto de Deuda (Capital)</label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Tasa Periódica Mensual (r): {(loanRate * 100).toFixed(2)}%</label>
                <input
                  type="range"
                  min="0.005"
                  max="0.1"
                  step="0.001"
                  value={loanRate}
                  onChange={(e) => setLoanRate(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-red-600 mt-3"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Plazo del Crédito (Meses)</label>
                <input
                  type="number"
                  value={loanPeriods}
                  onChange={(e) => setLoanPeriods(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Rosencharts SVG Visualizer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RosenBarChart
                title="Comparativa de Interés Total"
                subtitle="Diferencia de costo de capital generado entre el sistema Francés y el Alemán"
                data={[
                  { label: 'Francés (Fijo)', value: totalFrenchInterest, color: '#A91D22' },
                  { label: 'Alemán (Const)', value: totalGermanInterest, color: '#F4C430' }
                ]}
              />

              <RosenLineChart
                title="Evolución del Saldo de la Deuda"
                subtitle="Plan de amortización por período (mes)"
                periods={Array.from({ length: loanPeriods + 1 }, (_, i) => i)}
                series={[
                  {
                    name: 'Amortización Francesa',
                    data: [loanAmount, ...frenchSchedule.map((p) => p.endingBalance)],
                    color: '#A91D22'
                  },
                  {
                    name: 'Amortización Alemana',
                    data: [loanAmount, ...germanSchedule.map((p) => p.endingBalance)],
                    color: '#F4C430'
                  }
                ]}
              />
            </div>

            {/* Schedules Comparison Table */}
            <div className="bg-white/60 backdrop-blur-xl border border-neutral-100 rounded-3xl p-6 sm:p-8 shadow-sm overflow-hidden">
              <div className="flex justify-between items-center border-b border-neutral-100 pb-4 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Tabla Comparativa Detallada</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Muestra el desglose de cuotas e intereses de los dos sistemas periódicos.</p>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[350px] scrollbar-thin">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-neutral-50/50 sticky top-0 backdrop-blur-sm">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold text-neutral-700 border-b border-neutral-100">Mes</th>
                      <th className="py-2.5 px-4 font-semibold text-neutral-700 border-b border-neutral-100">Cuota Francesa</th>
                      <th className="py-2.5 px-4 font-semibold text-neutral-700 border-b border-neutral-100">Cuota Alemana</th>
                      <th className="py-2.5 px-4 font-semibold text-neutral-700 border-b border-neutral-100">Interés Francés</th>
                      <th className="py-2.5 px-4 font-semibold text-neutral-700 border-b border-neutral-100">Interés Alemán</th>
                      <th className="py-2.5 px-4 font-semibold text-neutral-700 border-b border-neutral-100">Capital Francés</th>
                      <th className="py-2.5 px-4 font-semibold text-neutral-700 border-b border-neutral-100">Capital Alemán</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {Array.from({ length: loanPeriods }).map((_, idx) => {
                      const fPeriod = frenchSchedule[idx];
                      const gPeriod = germanSchedule[idx];
                      if (!fPeriod || !gPeriod) return null;
                      return (
                        <tr key={idx} className="hover:bg-neutral-50/30">
                          <td className="py-2.5 px-4 font-mono font-medium">{idx + 1}</td>
                          <td className="py-2.5 px-4 font-mono">${fPeriod.payment.toFixed(2)}</td>
                          <td className="py-2.5 px-4 font-mono">${gPeriod.payment.toFixed(2)}</td>
                          <td className="py-2.5 px-4 font-mono text-red-700/80">${fPeriod.interest.toFixed(2)}</td>
                          <td className="py-2.5 px-4 font-mono text-amber-600/80">${gPeriod.interest.toFixed(2)}</td>
                          <td className="py-2.5 px-4 font-mono">${fPeriod.principal.toFixed(2)}</td>
                          <td className="py-2.5 px-4 font-mono">${gPeriod.principal.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 3: CAPITALIZACIÓN */}
        {/* ======================================================= */}
        {activeTab === 'capitalizacion' && (
          <div className="space-y-8">
            
            {/* Input Controls */}
            <div className="bg-white/60 backdrop-blur-xl border border-neutral-100 rounded-3xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Monto de Depósito ($)</label>
                <input
                  type="number"
                  value={capAmount}
                  onChange={(e) => setCapAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Tasa Rendimiento Periódico: {(capRate * 100).toFixed(2)}%</label>
                <input
                  type="range"
                  min="0.002"
                  max="0.05"
                  step="0.001"
                  value={capRate}
                  onChange={(e) => setCapRate(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-3"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Número de Meses</label>
                <input
                  type="number"
                  value={capPeriods}
                  onChange={(e) => setCapPeriods(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Line Chart Visualizer */}
            <div className="grid grid-cols-1 gap-8">
              <RosenLineChart
                title="Crecimiento de Ahorro Acumulado"
                subtitle="Comparación entre Depósito Único con Interés Compuesto vs Ahorro Constante Mensual"
                periods={Array.from({ length: capPeriods + 1 }, (_, i) => i)}
                series={[
                  {
                    name: `Depósito Único Inicial ($${capAmount})`,
                    data: [capAmount, ...compoundSchedule.map((p) => p.endingBalance)],
                    color: '#A91D22'
                  },
                  {
                    name: `Depósitos Mensuales Recurrentes ($${capAmount}/mes)`,
                    data: [0, ...annuitySchedule.map((p) => p.endingBalance)],
                    color: '#F4C430'
                  }
                ]}
              />
            </div>

            {/* Detail Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Compound Table */}
              <div className="bg-white/60 backdrop-blur-xl border border-neutral-100 rounded-3xl p-6 shadow-sm">
                <h4 className="text-xs font-bold text-red-700 uppercase tracking-wide mb-3">
                  Detalle: Depósito Único
                </h4>
                <div className="overflow-x-auto max-h-[250px] scrollbar-thin">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-100 bg-neutral-50/50">
                        <th className="py-2 px-3 font-semibold text-neutral-600">Mes</th>
                        <th className="py-2 px-3 font-semibold text-neutral-600">Saldo Inicial</th>
                        <th className="py-2 px-3 font-semibold text-neutral-600">Interés</th>
                        <th className="py-2 px-3 font-semibold text-neutral-600">Saldo Final</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compoundSchedule.map((row, idx) => (
                        <tr key={idx} className="border-b border-neutral-50 hover:bg-neutral-50/30">
                          <td className="py-2 px-3 font-mono">{row.period}</td>
                          <td className="py-2 px-3 font-mono">${row.beginningBalance.toFixed(2)}</td>
                          <td className="py-2 px-3 font-mono text-emerald-600">${row.interest.toFixed(2)}</td>
                          <td className="py-2 px-3 font-mono font-medium">${row.endingBalance.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Annuity Table */}
              <div className="bg-white/60 backdrop-blur-xl border border-neutral-100 rounded-3xl p-6 shadow-sm">
                <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-3">
                  Detalle: Ahorro Mensual Recurrente
                </h4>
                <div className="overflow-x-auto max-h-[250px] scrollbar-thin">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-100 bg-neutral-50/50">
                        <th className="py-2 px-3 font-semibold text-neutral-600">Mes</th>
                        <th className="py-2 px-3 font-semibold text-neutral-600">Depósito</th>
                        <th className="py-2 px-3 font-semibold text-neutral-600">Interés</th>
                        <th className="py-2 px-3 font-semibold text-neutral-600">Saldo Final</th>
                      </tr>
                    </thead>
                    <tbody>
                      {annuitySchedule.map((row, idx) => (
                        <tr key={idx} className="border-b border-neutral-50 hover:bg-neutral-50/30">
                          <td className="py-2 px-3 font-mono">{row.period}</td>
                          <td className="py-2 px-3 font-mono">${row.deposit.toFixed(2)}</td>
                          <td className="py-2 px-3 font-mono text-emerald-600">${row.interest.toFixed(2)}</td>
                          <td className="py-2 px-3 font-mono font-medium">${row.endingBalance.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 4: EDUCACIÓN */}
        {/* ======================================================= */}
        {activeTab === 'educacion' && (
          <EducationalSection />
        )}

      </div>
    </div>
  );
}
