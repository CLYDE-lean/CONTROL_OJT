const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function inspectAdvisor() {
  const { data, error } = await supabase
    .from('base_ojt')
    .select('*')
    .eq('dni', '61200222')
    .order('fecha_ah', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Total rows for 61200222: ${data.length}`);
  data.forEach((r, idx) => {
    console.log(`Row ${idx + 1}: fecha_ah=${r.fecha_ah}, dia_conex=${r.dia_conex}, kpi_1_num=${r.kpi_1_num}, kpi_2_num=${r.kpi_2_num}, ult_retiro=${r.ult_retiro}, estado=${r.estado}`);
  });
}

inspectAdvisor();
