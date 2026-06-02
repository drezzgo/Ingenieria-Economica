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

type Currency = 'COP' | 'USD' | 'BRL';

const currencyConfig = {
  COP: { symbol: '$', locale: 'es-CO', label: 'COP ($)', rateToCop: 1 },
  USD: { symbol: '$', locale: 'en-US', label: 'USD ($)', rateToCop: 4000 },
  BRL: { symbol: 'R$', locale: 'pt-BR', label: 'BRL (R$)', rateToCop: 800 }
};

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
  // ESTADOS GLOBALES DE DIVISA
  // ==========================================
  const [currency, setCurrency] = useState<Currency>('COP');

  const handleCurrencyChange = (newCurrency: Currency) => {
    const oldRate = currencyConfig[currency].rateToCop;
    const newRate = currencyConfig[newCurrency].rateToCop;
    
    const convert = (value: number) => {
      const valueInCop = value * oldRate;
      return Math.round((valueInCop / newRate) * 100) / 100;
    };

    setLoanAmount((prev) => convert(prev));
    setCapAmount((prev) => convert(prev));
    setCurrency(newCurrency);
  };

  const formatCurrencyValue = (value: number) => {
    const config = currencyConfig[currency];
    const decimals = currency === 'COP' ? 0 : 2;
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  const plClass = currency === 'BRL' ? 'pl-10' : 'pl-7';

  // ==========================================
  // ESTADOS - TAB 2: AMORTIZACIÓN (CRÉDITOS)
  // ==========================================
  const [loanAmount, setLoanAmount] = useState<number>(12000000); // 12 Millones COP por defecto
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
  const [capAmount, setCapAmount] = useState<number>(500000); // 500 Mil COP por defecto
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

        {/* Navigation & Currency Group */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 w-full md:w-auto">
          {/* Dynamic Tab Navigation (Apple style pill list) */}
          <div className="flex bg-neutral-100/80 p-1.5 rounded-2xl border border-neutral-200/50 w-full md:w-auto overflow-x-auto">
            {(['tasas', 'creditos', 'capitalizacion', 'educacion'] as const).map((tab) => {
              const isSelected = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 md:flex-none py-2.5 px-4 rounded-xl text-sm font-bold tracking-tight transition-all duration-350 cursor-pointer text-center capitalize whitespace-nowrap ${
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

          {/* Currency Switcher (Apple style pill list) */}
          <div className="flex bg-neutral-100/80 p-1.5 rounded-2xl border border-neutral-200/50 justify-between items-center gap-1.5 self-center">
            <span className="text-xs font-extrabold text-neutral-500 px-2 uppercase tracking-wider select-none">Divisa:</span>
            {(['COP', 'USD', 'BRL'] as const).map((curr) => {
              const isSelected = currency === curr;
              return (
                <button
                  key={curr}
                  onClick={() => handleCurrencyChange(curr)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all duration-350 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-red-700 shadow-sm border border-neutral-200/30 scale-[1.02]'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  {curr}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SPA DYNAMIC TAB WRAPPER */}
      <div className="tab-content-wrapper min-h-120">
        
        {/* ======================================================= */}
        {/* TAB 1: CONVERSIÓN DE TASAS */}
        {/* ======================================================= */}
        {activeTab === 'tasas' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* CARD 1: Nominal Anual <-> Efectiva Anual */}
            <div className="bg-white/60 backdrop-blur-xl border border-neutral-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-red-600 uppercase tracking-widest block mb-1">
                    Equivalencia Financiera
                  </span>
                  <h3 className="text-2xl font-bold text-neutral-950 tracking-tight">
                    Tasas Nominales y Efectivas
                  </h3>
                  <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed">
                    Relaciona la tasa de interés pactada nominal (j) con el impacto real efectiva anual (i).
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Nominal Input */}
                  <div className="bg-neutral-50/50 rounded-2xl p-4 border border-neutral-100 hover:border-red-500/20 hover:bg-neutral-50 transition-all duration-300">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-sm font-bold text-neutral-800">
                        Tasa Nominal Anual (j)
                      </span>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          step="0.01"
                          value={parseFloat((jRate * 100).toFixed(2))}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setJRate(Math.min(100, Math.max(0, val)) / 100);
                          }}
                          className="w-20 px-2 py-1 text-right text-sm font-bold font-mono text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        />
                        <span className="text-sm font-bold text-neutral-500">%</span>
                      </div>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="range"
                        min="0.01"
                        max="1.0"
                        step="0.01"
                        value={jRate}
                        onChange={(e) => setJRate(parseFloat(e.target.value))}
                        className="w-full aesthetic-slider slider-red"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1.5">
                      <span>1%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Compounding Input */}
                  <div className="bg-neutral-50/50 rounded-2xl p-4 border border-neutral-100 hover:border-red-500/20 hover:bg-neutral-50 transition-all duration-300">
                    <label className="block text-sm font-bold text-neutral-800 mb-2">
                      Frecuencia de Capitalización al Año (n)
                    </label>
                    <select
                      value={mPeriods}
                      onChange={(e) => setMPeriods(parseInt(e.target.value))}
                      className="w-full text-sm font-semibold px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors cursor-pointer"
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
                  <div className="bg-neutral-50/50 rounded-2xl p-4 border border-neutral-100 hover:border-amber-500/20 hover:bg-neutral-50 transition-all duration-300">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-sm font-bold text-neutral-800">
                        Tasa Efectiva Anual (i)
                      </span>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min="1"
                          max="150"
                          step="0.01"
                          value={parseFloat((iRateInput * 100).toFixed(2))}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setIRateInput(Math.min(150, Math.max(0, val)) / 100);
                          }}
                          className="w-20 px-2 py-1 text-right text-sm font-bold font-mono text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                        />
                        <span className="text-sm font-bold text-neutral-500">%</span>
                      </div>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="range"
                        min="0.01"
                        max="1.5"
                        step="0.01"
                        value={iRateInput}
                        onChange={(e) => setIRateInput(parseFloat(e.target.value))}
                        className="w-full aesthetic-slider slider-amber"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1.5">
                      <span>1%</span>
                      <span>75%</span>
                      <span>150%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Outputs Displays */}
              <div className="mt-8 pt-6 border-t border-neutral-100 grid grid-cols-2 gap-4">
                <div className="bg-linear-to-br from-red-50 to-white rounded-2xl p-5 border border-red-100 shadow-xs flex flex-col justify-between">
                  <span className="text-xs font-extrabold text-red-600 uppercase tracking-wider block">
                    Efectiva Anual Calc (i)
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-neutral-900 block mt-2 font-mono">
                    {(iResult * 100).toFixed(4)}%
                  </span>
                </div>
                <div className="bg-linear-to-br from-amber-50 to-white rounded-2xl p-5 border border-amber-100 shadow-xs flex flex-col justify-between">
                  <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wider block">
                    Nominal Anual Calc (j)
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-neutral-900 block mt-2 font-mono">
                    {(jResult * 100).toFixed(4)}%
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 2: Vencida <-> Anticipada */}
            <div className="bg-white/60 backdrop-blur-xl border border-neutral-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block mb-1">
                    Estructura de Vencimiento
                  </span>
                  <h3 className="text-2xl font-bold text-neutral-950 tracking-tight">
                    Tasas Vencidas y Anticipadas
                  </h3>
                  <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed">
                    Calcula la equivalencia al cambiar el cobro de intereses del fin de mes al inicio de mes.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Arrears Input */}
                  <div className="bg-neutral-50/50 rounded-2xl p-4 border border-neutral-100 hover:border-red-500/20 hover:bg-neutral-50 transition-all duration-300">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-sm font-bold text-neutral-800">
                        Tasa Periódica Vencida (iv)
                      </span>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min="0.5"
                          max="20"
                          step="0.01"
                          value={parseFloat((ivRate * 100).toFixed(2))}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setIvRate(Math.min(20, Math.max(0, val)) / 100);
                          }}
                          className="w-20 px-2 py-1 text-right text-sm font-bold font-mono text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        />
                        <span className="text-sm font-bold text-neutral-500">%</span>
                      </div>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="range"
                        min="0.005"
                        max="0.2"
                        step="0.001"
                        value={ivRate}
                        onChange={(e) => setIvRate(parseFloat(e.target.value))}
                        className="w-full aesthetic-slider slider-red"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1.5">
                      <span>0.5%</span>
                      <span>10%</span>
                      <span>20%</span>
                    </div>
                  </div>

                  {/* Advance Input */}
                  <div className="bg-neutral-50/50 rounded-2xl p-4 border border-neutral-100 hover:border-amber-500/20 hover:bg-neutral-50 transition-all duration-300">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-sm font-bold text-neutral-800">
                        Tasa Periódica Anticipada (ia)
                      </span>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min="0.5"
                          max="20"
                          step="0.01"
                          value={parseFloat((iaRate * 100).toFixed(2))}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setIaRate(Math.min(20, Math.max(0, val)) / 100);
                          }}
                          className="w-20 px-2 py-1 text-right text-sm font-bold font-mono text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                        />
                        <span className="text-sm font-bold text-neutral-500">%</span>
                      </div>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="range"
                        min="0.005"
                        max="0.2"
                        step="0.001"
                        value={iaRate}
                        onChange={(e) => setIaRate(parseFloat(e.target.value))}
                        className="w-full aesthetic-slider slider-amber"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1.5">
                      <span>0.5%</span>
                      <span>10%</span>
                      <span>20%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Output Results */}
              <div className="mt-8 pt-6 border-t border-neutral-100 grid grid-cols-2 gap-4">
                <div className="bg-linear-to-br from-red-50 to-white rounded-2xl p-5 border border-red-100 shadow-xs flex flex-col justify-between">
                  <span className="text-xs font-extrabold text-red-600 uppercase tracking-wider block">
                    Anticipada Equiv (ia)
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-neutral-900 block mt-2 font-mono">
                    {(iaResult * 100).toFixed(4)}%
                  </span>
                </div>
                <div className="bg-linear-to-br from-amber-50 to-white rounded-2xl p-5 border border-amber-100 shadow-xs flex flex-col justify-between">
                  <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wider block">
                    Vencida Equiv (iv)
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-neutral-900 block mt-2 font-mono">
                    {(ivResult * 100).toFixed(4)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Educational Callout */}
            <div className="lg:col-span-2 bg-linear-to-r from-red-600/5 to-amber-500/5 border border-red-500/10 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <span className="text-sm font-bold text-red-700 block">🧑‍🏫 Tip del Profesor de Ingeniería Económica</span>
                <p className="text-sm text-neutral-700 max-w-4xl leading-relaxed font-medium">
                  "Recuerda que la tasa periódica anticipada siempre será nominalmente inferior a su tasa periódica vencida equivalente,
                  porque el cobro anticipado disminuye el valor neto del flujo efectivo."
                </p>
              </div>
              <button
                onClick={() => setActiveTab('educacion')}
                className="text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Capital Input */}
              <div className="bg-white/60 backdrop-blur-xl border border-neutral-100 rounded-2xl p-5 shadow-sm hover:border-neutral-200 transition-all duration-300">
                <label className="block text-sm font-bold text-neutral-800 mb-2">Monto de Deuda (Capital)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-sm font-bold text-neutral-400 font-mono">
                    {currencyConfig[currency].symbol}
                  </span>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className={`w-full text-sm font-bold font-mono ${plClass} pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500 transition-colors`}
                  />
                </div>
              </div>

              {/* Tasa Mensual Input */}
              <div className="bg-white/60 backdrop-blur-xl border border-neutral-100 rounded-2xl p-5 shadow-sm hover:border-neutral-200 transition-all duration-300">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-neutral-800">Tasa Periódica Mensual (r)</label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min="0.5"
                      max="10"
                      step="0.01"
                      value={parseFloat((loanRate * 100).toFixed(2))}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setLoanRate(Math.min(10, Math.max(0, val)) / 100);
                      }}
                      className="w-16 px-2 py-1 text-right text-sm font-bold font-mono text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white"
                    />
                    <span className="text-sm font-bold text-neutral-500">%</span>
                  </div>
                </div>
                <div className="relative flex items-center pt-2">
                  <input
                    type="range"
                    min="0.005"
                    max="0.1"
                    step="0.001"
                    value={loanRate}
                    onChange={(e) => setLoanRate(parseFloat(e.target.value))}
                    className="w-full aesthetic-slider slider-red"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1">
                  <span>0.5%</span>
                  <span>5%</span>
                  <span>10%</span>
                </div>
              </div>

              {/* Plazo Input */}
              <div className="bg-white/60 backdrop-blur-xl border border-neutral-100 rounded-2xl p-5 shadow-sm hover:border-neutral-200 transition-all duration-300">
                <label className="block text-sm font-bold text-neutral-800 mb-2">Plazo del Crédito (Meses)</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={loanPeriods}
                    onChange={(e) => setLoanPeriods(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-sm font-bold font-mono px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500 transition-colors"
                  />
                  <span className="absolute right-3.5 text-sm font-bold text-neutral-400 uppercase tracking-wider">meses</span>
                </div>
              </div>
            </div>

            {/* Rosencharts SVG Visualizer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RosenBarChart
                title="Comparativa de Interés Total"
                subtitle="Diferencia de costo de capital generado entre el sistema Francés y el Alemán"
                currencySymbol={currencyConfig[currency].symbol}
                data={[
                  { label: 'Francés (Fijo)', value: totalFrenchInterest, color: '#A91D22' },
                  { label: 'Alemán (Const)', value: totalGermanInterest, color: '#F4C430' }
                ]}
              />

              <RosenLineChart
                title="Evolución del Saldo de la Deuda"
                subtitle="Plan de amortización por período (mes)"
                currencySymbol={currencyConfig[currency].symbol}
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
                  <h3 className="text-base font-bold text-neutral-900">Tabla Comparativa Detallada</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Muestra el desglose de cuotas e intereses de los dos sistemas periódicos.</p>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[350px] scrollbar-thin">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-neutral-100/80 sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="py-3 px-4 font-bold text-neutral-800 border-b border-neutral-200 border-b border-neutral-100">Mes</th>
                      <th className="py-3 px-4 font-bold text-neutral-800 border-b border-neutral-200 border-b border-neutral-100">Cuota Francesa</th>
                      <th className="py-3 px-4 font-bold text-neutral-800 border-b border-neutral-200 border-b border-neutral-100">Cuota Alemana</th>
                      <th className="py-3 px-4 font-bold text-neutral-800 border-b border-neutral-200 border-b border-neutral-100">Interés Francés</th>
                      <th className="py-3 px-4 font-bold text-neutral-800 border-b border-neutral-200 border-b border-neutral-100">Interés Alemán</th>
                      <th className="py-3 px-4 font-bold text-neutral-800 border-b border-neutral-200 border-b border-neutral-100">Capital Francés</th>
                      <th className="py-3 px-4 font-bold text-neutral-800 border-b border-neutral-200 border-b border-neutral-100">Capital Alemán</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {Array.from({ length: loanPeriods }).map((_, idx) => {
                      const fPeriod = frenchSchedule[idx];
                      const gPeriod = germanSchedule[idx];
                      if (!fPeriod || !gPeriod) return null;
                      return (
                        <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-neutral-900">{idx + 1}</td>
                          <td className="py-3 px-4 font-mono text-neutral-800">{formatCurrencyValue(fPeriod.payment)}</td>
                          <td className="py-3 px-4 font-mono text-neutral-800">{formatCurrencyValue(gPeriod.payment)}</td>
                          <td className="py-3 px-4 font-mono text-red-700 font-medium">{formatCurrencyValue(fPeriod.interest)}</td>
                          <td className="py-3 px-4 font-mono text-amber-700 font-medium">{formatCurrencyValue(gPeriod.interest)}</td>
                          <td className="py-3 px-4 font-mono text-neutral-800">{formatCurrencyValue(fPeriod.principal)}</td>
                          <td className="py-3 px-4 font-mono text-neutral-800">{formatCurrencyValue(gPeriod.principal)}</td>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Deposit Input */}
              <div className="bg-white/60 backdrop-blur-xl border border-neutral-100 rounded-2xl p-5 shadow-sm hover:border-neutral-200 transition-all duration-300">
                <label className="block text-sm font-bold text-neutral-800 mb-2">Monto de Depósito ({currencyConfig[currency].symbol})</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-sm font-bold text-neutral-400 font-mono">
                    {currencyConfig[currency].symbol}
                  </span>
                  <input
                    type="number"
                    value={capAmount}
                    onChange={(e) => setCapAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className={`w-full text-sm font-bold font-mono ${plClass} pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 transition-colors`}
                  />
                </div>
              </div>

              {/* Tasa Rendimiento Input */}
              <div className="bg-white/60 backdrop-blur-xl border border-neutral-100 rounded-2xl p-5 shadow-sm hover:border-neutral-200 transition-all duration-300">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-neutral-800">Rendimiento Periódico</label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min="0.2"
                      max="5"
                      step="0.01"
                      value={parseFloat((capRate * 100).toFixed(2))}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setCapRate(Math.min(5, Math.max(0, val)) / 100);
                      }}
                      className="w-16 px-2 py-1 text-right text-sm font-bold font-mono text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                    <span className="text-sm font-bold text-neutral-500">%</span>
                  </div>
                </div>
                <div className="relative flex items-center pt-2">
                  <input
                    type="range"
                    min="0.002"
                    max="0.05"
                    step="0.001"
                    value={capRate}
                    onChange={(e) => setCapRate(parseFloat(e.target.value))}
                    className="w-full aesthetic-slider slider-amber"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1">
                  <span>0.2%</span>
                  <span>2.6%</span>
                  <span>5%</span>
                </div>
              </div>

              {/* Plazo Ahorro Input */}
              <div className="bg-white/60 backdrop-blur-xl border border-neutral-100 rounded-2xl p-5 shadow-sm hover:border-neutral-200 transition-all duration-300">
                <label className="block text-sm font-bold text-neutral-800 mb-2">Número de Meses</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={capPeriods}
                    onChange={(e) => setCapPeriods(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-sm font-bold font-mono px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                  <span className="absolute right-3.5 text-sm font-bold text-neutral-400 uppercase tracking-wider">meses</span>
                </div>
              </div>
            </div>

            {/* Line Chart Visualizer */}
            <div className="grid grid-cols-1 gap-8">
              <RosenLineChart
                title="Crecimiento de Ahorro Acumulado"
                subtitle="Comparación entre Depósito Único con Interés Compuesto vs Ahorro Constante Mensual"
                currencySymbol={currencyConfig[currency].symbol}
                periods={Array.from({ length: capPeriods + 1 }, (_, i) => i)}
                series={[
                  {
                    name: `Depósito Único Inicial (${formatCurrencyValue(capAmount)})`,
                    data: [capAmount, ...compoundSchedule.map((p) => p.endingBalance)],
                    color: '#A91D22'
                  },
                  {
                    name: `Depósitos Mensuales Recurrentes (${formatCurrencyValue(capAmount)}/mes)`,
                    data: [0, ...annuitySchedule.map((p) => p.endingBalance)],
                    color: '#F4C430'
                  }
                ]}
              />
            </div>

            {/* Detail Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Compound Table */}
              <div className="bg-white/60 backdrop-blur-xl border border-neutral-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h4 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-4">
                  Detalle: Depósito Único
                </h4>
                <div className="overflow-x-auto max-h-[250px] scrollbar-thin">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-100/50">
                        <th className="py-2.5 px-3 font-bold text-neutral-800">Mes</th>
                        <th className="py-2.5 px-3 font-bold text-neutral-800">Saldo Inicial</th>
                        <th className="py-2.5 px-3 font-bold text-neutral-800">Interés</th>
                        <th className="py-2.5 px-3 font-bold text-neutral-800">Saldo Final</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {compoundSchedule.map((row, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-neutral-900">{row.period}</td>
                          <td className="py-2.5 px-3 font-mono text-neutral-800">{formatCurrencyValue(row.beginningBalance)}</td>
                          <td className="py-2.5 px-3 font-mono text-emerald-600 font-semibold">+{formatCurrencyValue(row.interest)}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-neutral-900">{formatCurrencyValue(row.endingBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Annuity Table */}
              <div className="bg-white/60 backdrop-blur-xl border border-neutral-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h4 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-4">
                  Detalle: Ahorro Mensual Recurrente
                </h4>
                <div className="overflow-x-auto max-h-[250px] scrollbar-thin">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-100/50">
                        <th className="py-2.5 px-3 font-bold text-neutral-800">Mes</th>
                        <th className="py-2.5 px-3 font-bold text-neutral-800">Depósito</th>
                        <th className="py-2.5 px-3 font-bold text-neutral-800">Interés</th>
                        <th className="py-2.5 px-3 font-bold text-neutral-800">Saldo Final</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {annuitySchedule.map((row, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-neutral-900">{row.period}</td>
                          <td className="py-2.5 px-3 font-mono text-neutral-800">{formatCurrencyValue(row.deposit)}</td>
                          <td className="py-2.5 px-3 font-mono text-emerald-600 font-semibold">+{formatCurrencyValue(row.interest)}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-neutral-900">{formatCurrencyValue(row.endingBalance)}</td>
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
