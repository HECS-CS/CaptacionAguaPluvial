function calcular(area, precipitacion_mm, eficiencia, costo=0, precio_por_litro=0) {
  // normalizar y validar
  area = Number(area);
  precipitacion_mm = Number(precipitacion_mm);
  eficiencia = Number(eficiencia);
  if (!isFinite(area) || !isFinite(precipitacion_mm) || !isFinite(eficiencia)) throw new Error('Inputs no numéricos');
  if (area <= 0 || precipitacion_mm <= 0 || eficiencia <= 0) return { error: 'Valores deben ser > 0' };
  if (eficiencia > 1 && eficiencia <= 100) eficiencia = eficiencia/100;
  if (eficiencia > 100) eficiencia = 1;
  const litrosAnuales = area * precipitacion_mm * eficiencia;
  const litrosMensuales = litrosAnuales / 12;
  const ahorroAnual = precio_por_litro ? litrosAnuales * precio_por_litro : 0;
  const anosRecuperacion = ahorroAnual > 0 ? (costo / ahorroAnual) : Infinity;
  const roiPorc = costo > 0 ? (ahorroAnual / costo) * 100 : 0;
  return { litrosAnuales, litrosMensuales, ahorroAnual, anosRecuperacion, roiPorc };
}

function assertEq(actual, expected, msg) {
  const ok = (Number.isFinite(expected) ? Math.abs(actual - expected) < 1e-6 : actual === expected);
  console.log(ok ? 'PASS' : 'FAIL', msg, '=>', actual, '(expected', expected + ')');
}

try {
  console.log('Test A (normal)');
  let r = calcular(50,800,85,2000,0.02);
  assertEq(r.litrosAnuales, 34000, 'litrosAnuales');
  assertEq(Number((r.ahorroAnual).toFixed(2)), 680, 'ahorroAnual');
  console.log('añosRecuperacion ≈', r.anosRecuperacion.toFixed(2));

  console.log('\nTest B (precio 0 -> no recuperable)');
  r = calcular(100,600,0.9,1000,0);
  assertEq(r.ahorroAnual, 0, 'ahorroAnual');
  assertEq(r.anosRecuperacion, Infinity, 'anosRecuperacion');

  console.log('\nTest C (eficiencia >100 normalizar)');
  r = calcular(10,100,150,0,0.01);
  assertEq(r.litrosAnuales, 10*100*1, 'eficiencia normalizada a 1');

  console.log('\nTest D (invalidos)');
  let e = calcular(0,800,85);
  console.log(e.error ? 'PASS invalid input' : 'FAIL invalid input');

  console.log('\nTest E (grandes números)');
  r = calcular(100000,2000,1,1000000,0.01);
  console.log('litrosAnuales', r.litrosAnuales, '-> OK if finite');

  console.log('\nTodos los tests terminados.');
} catch (err) {
  console.error('Error en tests:', err);
}