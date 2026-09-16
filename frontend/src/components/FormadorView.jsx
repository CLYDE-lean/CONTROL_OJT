import React, { useState } from 'react';
import { Users, Wrench, LogOut, Clock } from 'lucide-react';
import ScatterVolumenVsCalidad from './ScatterVolumenVsCalidad';
import RankingResultadoFormadores from './RankingResultadoFormadores';
import MatrizCohorteAulas from './MatrizCohorteAulas';
import { sumFte } from '../utils/fte';

function KpiMini({ titulo, valor, extra, sub, color, Icon }) {
  return (
    <div className="kpi-mini-card" style={{
      background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.92) 100%)',
      borderRadius: '12px',
      padding: '10px 12px 10px 14px',
      border: '1px solid rgba(148, 163, 184, 0.16)',
      boxShadow: '0 8px 24px rgba(2, 6, 23, 0.28)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '72px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
        background: color, boxShadow: `0 0 10px ${color}55`
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.66rem', fontWeight: 600, color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>
          {titulo}
        </span>
        <Icon size={16} style={{ color, strokeWidth: 1.8 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', marginTop: '4px' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
          {valor}
        </span>
        {extra && (
          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#34d399', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
            {extra}
          </span>
        )}
      </div>
      {sub && (
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>
          {sub}
        </span>
      )}
    </div>
  );
}

export default function FormadorView({ data }) {
  const [formadorActivo, setFormadorActivo] = useState(null);
  const [grupoActivo, setGrupoActivo] = useState(null);

  const embudo = data?.embudo;
  const listAsesores = (data?.matriz?.asesores || []).filter((a) => Number(a.asistio_d1) === 1);
  const iniciaron = Number(embudo?.iniciaron_ojt_d1 ?? embudo?.base_ojt) || listAsesores.length || 0;
  const total = iniciaron;

  const iopAsesores = listAsesores.filter(a => Number(a.es_iop) === 1);
  const egresadosOp = iopAsesores.length;
  const iopFte = sumFte(iopAsesores);
  const bajas = listAsesores.filter(a => Number(a.es_baja) === 1 && Number(a.es_iop) !== 1).length;
  const enCurso = Math.max(0, total - egresadosOp - bajas);
  const campusPct = total > 0 ? Math.round((egresadosOp / total) * 1000) / 10 : 0;

  const pct = (n) => (total > 0 ? `${Math.round((n / total) * 100)}%` : '0%');

  const dia5 = embudo?.dias_principales_1_8?.find(d => d.dia === 5);
  const retencionD5 = dia5?.retencion_pct ?? null;

  const needleFormador = formadorActivo ? String(formadorActivo).toUpperCase() : null;
  const asesoresMatriz = needleFormador
    ? listAsesores.filter((a) => String(a.formador || '').toUpperCase().includes(needleFormador))
    : listAsesores;

  return (
    <div className="formador-view">
      <div className="formador-kpis">
        <KpiMini titulo="Iniciaron OJT" valor={iniciaron.toLocaleString()} sub="asistencia con DIA_CONEXION = 1" color="#38bdf8" Icon={Users} />
        <KpiMini
          titulo="IOP"
          valor={egresadosOp.toLocaleString()}
          extra={`${iopFte} FTE`}
          sub={`${pct(egresadosOp)} a operación`}
          color="#34d399"
          Icon={Wrench}
        />
        <KpiMini titulo="Bajas OJT" valor={bajas.toLocaleString()} sub={pct(bajas)} color="#fb7185" Icon={LogOut} />
        <KpiMini
          titulo="En curso"
          valor={enCurso.toLocaleString()}
          sub={retencionD5 != null ? `Ret. D5 ${retencionD5}%` : pct(enCurso)}
          color="#fbbf24"
          Icon={Clock}
        />
      </div>

      <div className="formador-body">
        <div className="formador-top">
          <div className="formador-scatter">
            <ScatterVolumenVsCalidad
              data={data}
              formadorActivo={formadorActivo}
              grupoActivo={grupoActivo}
            />
          </div>
          <div className="formador-ranking">
            <RankingResultadoFormadores
              asesores={listAsesores}
              campusPct={campusPct}
              formadorActivo={formadorActivo}
              onSelect={(f) => { setFormadorActivo(f); setGrupoActivo(null); }}
            />
          </div>
        </div>
        <div className="formador-aulas">
          <MatrizCohorteAulas
            asesores={asesoresMatriz}
            grupoActivo={grupoActivo}
            onSelectGrupo={setGrupoActivo}
          />
        </div>
      </div>
    </div>
  );
}
