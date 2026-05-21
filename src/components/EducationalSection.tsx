import React, { useState } from 'react';

interface Scenario {
  id: string;
  title: string;
  icon: string;
  description: string;
  udTip: string;
  recommendation: string;
  formulaExpl: string;
}

export default function EducationalSection() {
  const [selectedScenario, setSelectedScenario] = useState<string>('advance-loans');

  const scenarios: Scenario[] = [
    {
      id: 'advance-loans',
      title: 'Créditos de Consumo y Tasas Anticipadas',
      icon: '⚠️',
      description: 'En el sector financiero, a veces te ofrecen tasas del "1.8% mensual anticipado" en lugar de "2% mensual vencido". A simple vista, el número parece menor. Sin embargo, en un crédito anticipado los intereses se cobran al inicio del período. Esto reduce el capital neto que realmente recibes, mientras sigues pagando intereses por el valor nominal completo.',
      udTip: 'Si pides un préstamo de $10,000 al 2% mensual anticipado, te descuentan $200 de inmediato. Recibes neto $9,800, pero debes pagar y amortizar sobre $10,000. ¡El costo real de financiación es del 2.04% mensual vencido!',
      formulaExpl: 'Fórmula de conversión clave: iv = ia / (1 - ia). Si ia = 1.96%, iv = 0.0196 / (1 - 0.0196) = 2.00% vencido.',
      recommendation: 'Evita a toda costa tasas anticipadas al adquirir deudas de consumo o comerciales, ya que disfrazan una tasa de interés real (vencida) más alta.'
    },
    {
      id: 'french-vs-german',
      title: 'Sistema Francés vs. Alemán: ¿Cuál elegir?',
      icon: '⚖️',
      description: 'El Sistema Francés establece cuotas fijas mensuales durante todo el crédito, donde al inicio se paga principalmente interés y al final abono a capital. El Sistema Alemán amortiza una porción fija constante a capital en cada cuota; al disminuir el saldo rápidamente, los intereses decrecen velozmente, haciendo que las cuotas sean más altas al principio y disminuyan con el tiempo.',
      udTip: 'El Sistema Alemán genera menor gasto total de interés que el Sistema Francés debido a que amortiza el saldo de la deuda más rápido desde el primer mes.',
      formulaExpl: 'Amortización Alemana: Abono = Principal / N (fijo). Amortización Francesa: Cuota = Principal * [r*(1+r)^N] / [(1+r)^N - 1] (fijo).',
      recommendation: 'Elige el Sistema Alemán si tu flujo de caja inicial es alto y quieres pagar menos intereses en total. Elige el Sistema Francés si requieres cuotas predecibles y de menor impacto inmediato en tu presupuesto mensual.'
    },
    {
      id: 'capitalization-compound',
      title: 'Capitalización: El Poder del Interés Compuesto',
      icon: '📈',
      description: 'La capitalización es el proceso en el cual los intereses generados se reinvierten para formar parte del nuevo capital del siguiente período. En Ingeniería Económica, esto se conoce como interés compuesto y es la base de las inversiones de largo plazo, fondos de pensiones y cuentas de ahorro de alto rendimiento.',
      udTip: 'Al reinvertirse, el dinero crece exponencialmente en lugar de linealmente como ocurre en el interés simple (donde los intereses no generan nuevos intereses).',
      formulaExpl: 'Fórmula exponencial: S = P * (1 + r)^N. Cada período suma r% sobre el saldo acumulado acumulando una bola de nieve.',
      recommendation: 'Al invertir o ahorrar, busca capitalización con alta frecuencia (por ejemplo mensual en lugar de anual) para que los intereses se sumen al capital más rápido y aceleren el crecimiento de tus recursos.'
    }
  ];

  const currentScenario = scenarios.find((s) => s.id === selectedScenario) || scenarios[0];

  return (
    <div className="bg-white/60 backdrop-blur-lg border border-neutral-100 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="border-b border-neutral-100 pb-5 mb-6">
        <span className="text-xs font-bold text-red-600 uppercase tracking-widest block mb-1">
          Guía Didáctica Interactiva
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Conceptos Clave de Ingeniería Económica
        </h2>
        <p className="text-neutral-500 text-sm mt-1.5">
          Aprende el sustento matemático detrás de las tasas de interés y amortizaciones para tomar mejores decisiones financieras.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {scenarios.map((scen) => {
            const isSelected = selectedScenario === scen.id;
            return (
              <button
                key={scen.id}
                onClick={() => setSelectedScenario(scen.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-350 cursor-pointer ${
                  isSelected
                    ? 'bg-red-50/70 border-red-200 text-red-950 shadow-sm scale-[1.01]'
                    : 'bg-neutral-50/50 border-neutral-100 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{scen.icon}</span>
                  <div>
                    <span className="text-sm font-bold block leading-tight">{scen.title}</span>
                    <span className="text-[11px] text-neutral-500 font-medium block mt-0.5">
                      {scen.id === 'advance-loans' && 'Conversión de Tasas'}
                      {scen.id === 'french-vs-german' && 'Amortizaciones'}
                      {scen.id === 'capitalization-compound' && 'Ahorro y Capitalización'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Detail Card */}
        <div className="lg:col-span-8 bg-neutral-50/50 border border-neutral-100 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{currentScenario.icon}</span>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900">
                {currentScenario.title}
              </h3>
            </div>
            
            <p className="text-neutral-600 text-sm leading-relaxed">
              {currentScenario.description}
            </p>

            {/* Academic Tip (UD Styled) */}
            <div className="bg-white border-l-4 border-amber-500 rounded-r-2xl p-4 shadow-xs">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
                💡 Caso Práctico Académico
              </span>
              <p className="text-neutral-700 text-xs leading-relaxed font-medium">
                {currentScenario.udTip}
              </p>
            </div>

            {/* Math Formula Expl */}
            <div className="bg-white border border-neutral-150 rounded-2xl p-4 font-mono text-[11px] text-neutral-600 space-y-1">
              <span className="font-sans font-bold text-neutral-800 text-xs block mb-1">Fórmula Aplicada</span>
              <p className="text-red-700 font-semibold">{currentScenario.formulaExpl}</p>
            </div>
          </div>

          {/* Recommendation Box */}
          <div className="mt-6 pt-5 border-t border-neutral-100">
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4">
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider block mb-1">
                📌 Recomendación de Equis UD
              </span>
              <p className="text-red-950 text-xs leading-relaxed font-semibold">
                {currentScenario.recommendation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
