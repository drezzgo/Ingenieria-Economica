import React, { useState, useEffect } from 'react';
import {
  nominalToEffective,
  effectiveToNominal,
  arrearsToAdvance,
  advanceToArrears,
  calculateFrenchAmortization,
  calculateGermanAmortization,
  type AmortizationPeriod
} from '../lib/finance';

export default function MainCalculator() {
  // Estados para datos de prueba modificables
  const [nominalRate, setNominalRate] = useState<number>(0.24); // 24%
  const [periodsPerYear, setPeriodsPerYear] = useState<number>(12); // Mensual
  const [effectiveRate, setEffectiveRate] = useState<number>(0.2682); // 26.82%
  const [arrearsRate, setArrearsRate] = useState<number>(0.02); // 2%
  const [advanceRate, setAdvanceRate] = useState<number>(0.0196); // 1.96%
  
  const [principal, setPrincipal] = useState<number>(10000); // $10,000 USD/COP
  const [periodicRate, setPeriodicRate] = useState<number>(0.02); // 2% mensual
  const [periods, setPeriods] = useState<number>(5); // 5 meses

  // Estado para guardar el historial del "Consola Simulada" en la interfaz
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  // Función para agregar logs a la consola simulada
  const addLog = (message: string) => {
    setConsoleLogs((prev) => [...prev, message]);
  };

  // Función para ejecutar las conversiones y cálculos e imprimirlos en la consola
  const handleExecute = () => {
    setConsoleLogs([]); // Limpiar consola simulada
    console.clear();

    const timestamp = new Date().toLocaleTimeString();
    addLog(`[${timestamp}] === INICIANDO PRUEBAS DE EQUI UD ===`);
    addLog(`(Abre la consola de desarrollo del navegador [F12] para ver el desglose completo en formato interactivo)`);

    console.group(`%c Equi UD - Pruebas Financieras (${timestamp}) `, 'background: #A91D22; color: #FFF; font-weight: bold; font-size: 14px; padding: 4px; border-radius: 4px;');

    // 1. Nominal a Efectiva
    try {
      const eff = nominalToEffective(nominalRate, periodsPerYear);
      const text = `Tasa Nominal Anual de ${(nominalRate * 100).toFixed(2)}% con capitalización de ${periodsPerYear} períodos al año equivale a una Tasa Efectiva Anual (E.A.) de ${(eff * 100).toFixed(4)}%`;
      console.log(`%c[Nominal a Efectiva]%c ${text}`, 'color: #A91D22; font-weight: bold;', 'color: inherit;');
      addLog(`👉 Nominal a Efectiva: ${text}`);
    } catch (error: any) {
      console.error("Error en Nominal a Efectiva:", error.message);
      addLog(`❌ Error en Nominal a Efectiva: ${error.message}`);
    }

    // 2. Efectiva a Nominal
    try {
      const nom = effectiveToNominal(effectiveRate, periodsPerYear);
      const text = `Tasa Efectiva Anual (E.A.) de ${(effectiveRate * 100).toFixed(2)}% capitalizable ${periodsPerYear} veces al año equivale a una Tasa Nominal Anual (T.N.A.) de ${(nom * 100).toFixed(4)}%`;
      console.log(`%c[Efectiva a Nominal]%c ${text}`, 'color: #A91D22; font-weight: bold;', 'color: inherit;');
      addLog(`👉 Efectiva a Nominal: ${text}`);
    } catch (error: any) {
      console.error("Error en Efectiva a Nominal:", error.message);
      addLog(`❌ Error en Efectiva a Nominal: ${error.message}`);
    }

    // 3. Vencida a Anticipada
    try {
      const ant = arrearsToAdvance(arrearsRate);
      const text = `Tasa Periódica Vencida de ${(arrearsRate * 100).toFixed(2)}% equivale a una Tasa Periódica Anticipada de ${(ant * 100).toFixed(4)}%`;
      console.log(`%c[Vencida a Anticipada]%c ${text}`, 'color: #D97706; font-weight: bold;', 'color: inherit;');
      addLog(`👉 Vencida a Anticipada: ${text}`);
    } catch (error: any) {
      console.error("Error en Vencida a Anticipada:", error.message);
      addLog(`❌ Error en Vencida a Anticipada: ${error.message}`);
    }

    // 4. Anticipada a Vencida
    try {
      const ven = advanceToArrears(advanceRate);
      const text = `Tasa Periódica Anticipada de ${(advanceRate * 100).toFixed(2)}% equivale a una Tasa Periódica Vencida de ${(ven * 100).toFixed(4)}%`;
      console.log(`%c[Anticipada a Vencida]%c ${text}`, 'color: #D97706; font-weight: bold;', 'color: inherit;');
      addLog(`👉 Anticipada a Vencida: ${text}`);
    } catch (error: any) {
      console.error("Error en Anticipada a Vencida:", error.message);
      addLog(`❌ Error en Anticipada a Vencida: ${error.message}`);
    }

    // 5. Amortización Francesa
    try {
      const frenchSchedule = calculateFrenchAmortization(principal, periodicRate, periods);
      console.group(`%c Amortización Francesa (Cuota Fija) - Principal: $${principal} - Tasa Periódica: ${(periodicRate * 100).toFixed(2)}% - Plazo: ${periods} meses `, 'color: #FFF; background: #2563EB; font-weight: bold; padding: 2px;');
      console.table(frenchSchedule.map(p => ({
        Período: p.period,
        'Saldo Inicial': `$${p.beginningBalance.toFixed(2)}`,
        Cuota: `$${p.payment.toFixed(2)}`,
        Interés: `$${p.interest.toFixed(2)}`,
        Capital: `$${p.principal.toFixed(2)}`,
        'Saldo Final': `$${p.endingBalance.toFixed(2)}`
      })));
      console.groupEnd();
      
      const totalFrenchInterest = frenchSchedule.reduce((sum, p) => sum + p.interest, 0);
      const frenchText = `Amortización Francesa completada. Cuota fija mensual: $${(frenchSchedule[0]?.payment || 0).toFixed(2)}. Total Intereses: $${totalFrenchInterest.toFixed(2)}`;
      addLog(`👉 Amortización Francesa: ${frenchText} (Ver tabla en consola del desarrollador)`);
    } catch (error: any) {
      console.error("Error en Amortización Francesa:", error.message);
      addLog(`❌ Error en Amortización Francesa: ${error.message}`);
    }

    // 6. Amortización Alemana
    try {
      const germanSchedule = calculateGermanAmortization(principal, periodicRate, periods);
      console.group(`%c Amortización Alemana (Abono Constante a Capital) - Principal: $${principal} - Tasa Periódica: ${(periodicRate * 100).toFixed(2)}% - Plazo: ${periods} meses `, 'color: #FFF; background: #059669; font-weight: bold; padding: 2px;');
      console.table(germanSchedule.map(p => ({
        Período: p.period,
        'Saldo Inicial': `$${p.beginningBalance.toFixed(2)}`,
        Cuota: `$${p.payment.toFixed(2)}`,
        Interés: `$${p.interest.toFixed(2)}`,
        'Abono Capital': `$${p.principal.toFixed(2)}`,
        'Saldo Final': `$${p.endingBalance.toFixed(2)}`
      })));
      console.groupEnd();

      const totalGermanInterest = germanSchedule.reduce((sum, p) => sum + p.interest, 0);
      const germanText = `Amortización Alemana completada. Abono constante a capital: $${(germanSchedule[0]?.principal || 0).toFixed(2)}. Total Intereses: $${totalGermanInterest.toFixed(2)}`;
      addLog(`👉 Amortización Alemana: ${germanText} (Ver tabla en consola del desarrollador)`);
    } catch (error: any) {
      console.error("Error en Amortización Alemana:", error.message);
      addLog(`❌ Error en Amortización Alemana: ${error.message}`);
    }

    console.groupEnd();
    addLog(`[${new Date().toLocaleTimeString()}] === FIN DE LAS PRUEBAS ===`);
  };

  // Ejecutar automáticamente al cargar para cumplir con el requerimiento de que por ahora imprima al iniciar con datos de prueba
  useEffect(() => {
    handleExecute();
  }, []);

  return (
    <div className="space-y-8">
      {/* Title & Academic Info Header Card */}
      <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-6 sm:p-8">
        <div className="max-w-3xl">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100 mb-4">
            Ingeniería Económica
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Plataforma de Cálculos Financieros <span className="text-red-600">Equi UD</span>
          </h1>
          <p className="mt-3 text-lg text-neutral-600 leading-relaxed">
            Software diseñado para la conversión de tasas de interés y la generación de planes de amortización
            (Sistema Francés y Alemán). Utiliza el botón inferior para disparar las pruebas y observar
            los desgloses matemáticos detallados tanto en la terminal simulada como en la consola del navegador.
          </p>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Interactive Test Parameters Form */}
        <div className="lg:col-span-5 bg-white border border-neutral-100 rounded-2xl shadow-sm p-6 space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <h2 className="text-lg font-bold text-neutral-950">Datos de Prueba</h2>
            <p className="text-xs text-neutral-500 mt-1">Configura los parámetros financieros para ejecutar las funciones.</p>
          </div>

          {/* Section 1: Rates */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wider">Tasas de Interés</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Nominal Anual (j)</label>
                <input
                  type="number"
                  step="0.01"
                  value={nominalRate}
                  onChange={(e) => setNominalRate(parseFloat(e.target.value) || 0)}
                  className="w-full text-sm px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Períodos al Año (n)</label>
                <input
                  type="number"
                  value={periodsPerYear}
                  onChange={(e) => setPeriodsPerYear(parseInt(e.target.value) || 1)}
                  className="w-full text-sm px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-medium text-neutral-600 mb-1">Efectiva Anual (i)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={effectiveRate}
                  onChange={(e) => setEffectiveRate(parseFloat(e.target.value) || 0)}
                  className="w-full text-sm px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-medium text-neutral-600 mb-1">Periódica Ven. (iv)</label>
                <input
                  type="number"
                  step="0.001"
                  value={arrearsRate}
                  onChange={(e) => setArrearsRate(parseFloat(e.target.value) || 0)}
                  className="w-full text-sm px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-medium text-neutral-600 mb-1">Periódica Ant. (ia)</label>
                <input
                  type="number"
                  step="0.001"
                  value={advanceRate}
                  onChange={(e) => setAdvanceRate(parseFloat(e.target.value) || 0)}
                  className="w-full text-sm px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Amortization */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Crédito y Amortización</h3>
            
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Monto del Crédito (Principal)</label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
                className="w-full text-sm px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Tasa Periódica (r)</label>
                <input
                  type="number"
                  step="0.001"
                  value={periodicRate}
                  onChange={(e) => setPeriodicRate(parseFloat(e.target.value) || 0)}
                  className="w-full text-sm px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Número de Meses (N)</label>
                <input
                  type="number"
                  value={periods}
                  onChange={(e) => setPeriods(parseInt(e.target.value) || 1)}
                  className="w-full text-sm px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={handleExecute}
            className="w-full py-3 px-4 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 active:scale-[0.98] transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center space-x-2 border-2 border-transparent hover:border-amber-400"
          >
            <span>Ejecutar y Loggear Pruebas</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
          </button>
        </div>

        {/* Simulated Output / Logs */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col h-[520px]">
          <div className="flex justify-between items-center border-b border-neutral-850 pb-4 mb-4">
            <div className="flex items-center space-x-2">
              <span className="h-3.5 w-3.5 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-xs font-mono font-bold text-neutral-300">CONSOLA SIMULADA DE EQUI UD</span>
            </div>
            <button
              onClick={() => setConsoleLogs([])}
              className="text-neutral-500 hover:text-neutral-300 text-xs font-mono px-2 py-1 rounded bg-neutral-800 transition-colors cursor-pointer"
            >
              clear
            </button>
          </div>

          {/* Log Content Area */}
          <div className="flex-grow font-mono text-xs overflow-y-auto space-y-2.5 text-neutral-300 scrollbar-thin scrollbar-thumb-neutral-800 pr-2">
            {consoleLogs.length === 0 ? (
              <p className="text-neutral-500 italic">No hay logs generados. Haz click en "Ejecutar y Loggear Pruebas" para iniciar.</p>
            ) : (
              consoleLogs.map((log, idx) => {
                let textStyle = "text-neutral-300";
                if (log.includes("❌")) textStyle = "text-red-400";
                if (log.includes("👉")) textStyle = "text-emerald-400";
                if (log.includes("===")) textStyle = "text-amber-400 font-semibold";
                return (
                  <div key={idx} className={`${textStyle} break-words leading-relaxed`}>
                    {log}
                  </div>
                );
              })
            )}
          </div>

          {/* Terminal Footer Tip */}
          <div className="mt-4 pt-4 border-t border-neutral-850 text-[10px] font-mono text-neutral-500 flex justify-between">
            <span>UDFJC - Ingeniería Económica</span>
            <span>PRESIONA F12 PARA VER CONSOLE.TABLE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
