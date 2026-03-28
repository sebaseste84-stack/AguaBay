import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fduzfoafowqwbirsayws.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkdXpmb2Fmb3dxd2JpcnNheXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2OTcxMDYsImV4cCI6MjA5MDI3MzEwNn0.iSUZE-ulvN53v8MVcVUBNHXvTdxNBZ3aE9mK08lQYz4";

const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [unidades, setUnidades] = useState<any[]>([]);

  useEffect(() => {
    fetchUnidades();
    const interval = setInterval(fetchUnidades, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchUnidades() {
    const { data } = await supabase
      .from("Unidades")
      .select("*")
      .order("unidad");

    setUnidades(data || []);
  }

  async function toggleCampo(id: number, campo: string, valor: boolean) {
    await supabase
      .from("Unidades")
      .update({ [campo]: !valor })
      .eq("id", id);

    fetchUnidades();
  }

  async function actualizarCampo(id: number, campo: string, valor: any) {
    await supabase
      .from("Unidades")
      .update({ [campo]: valor })
      .eq("id", id);

    fetchUnidades();
  }

  function diasEntre(fecha: string) {
    if (!fecha) return null;
    return Math.floor(
      (new Date().getTime() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  function diasHasta(fecha: string) {
    if (!fecha) return null;
    return Math.ceil(
      (new Date(fecha).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  function getTareasTexto(u: any) {
    if (!u.fecha_in || !u.fecha_out) {
      return { toallas: "-", blanco: "-" };
    }

    const dias = diasEntre(u.fecha_in);
    const restantes = diasHasta(u.fecha_out);

    if (restantes <= 1) {
      return { toallas: "-", blanco: "-" };
    }

    const toallas = dias > 0 && dias % 2 === 0 ? "Hoy" : "No";
    const blanco = dias > 0 && dias % 4 === 0 ? "Hoy" : "No";

    return { toallas, blanco };
  }

  function getEstadoColor(u: any) {
    if (u.mantenimiento) return "#f44336";
    if (!u.repaso) return "#fbc02d";
    if (
      getTareasTexto(u).toallas === "Hoy" ||
      getTareasTexto(u).blanco === "Hoy"
    )
      return "#ff9800";
    return "#4caf50";
  }

  function getGrupo(unidad: number) {
    if (unidad >= 101 && unidad <= 107) return "Planta Baja";
    if (unidad >= 201 && unidad <= 208) return "Primer Piso";
    if (unidad >= 301 && unidad <= 310) return "Segundo Piso";
    if (unidad >= 401) return "Cabañas";
  }

  function agrupar() {
    const grupos: any = {
      "Planta Baja": [],
      "Primer Piso": [],
      "Segundo Piso": [],
      Cabañas: [],
    };

    unidades.forEach((u) => {
      const g = getGrupo(Number(u.unidad));
      if (g) grupos[g].push(u);
    });

    return grupos;
  }

  const grupos = agrupar();

  return (
    <div
      style={{
        padding: 15,
        background: "#f4f6f8",
        minHeight: "100vh",
        fontFamily: "Arial",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>🏨 Agua Bay</h2>

      {Object.entries(grupos).map(([nombre, lista]: any) => (
        <div key={nombre} style={{ marginBottom: 25 }}>
          <h3>{nombre}</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 10,
            }}
          >
            {lista.map((u: any) => {
              const tareas = getTareasTexto(u);

              return (
                <div
                  key={u.id}
                  style={{
                    background: "white",
                    padding: 10,
                    borderRadius: 12,
                    boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
                    borderLeft: `5px solid ${getEstadoColor(u)}`,
                    fontSize: 12,
                  }}
                >
                  <strong>Unidad {u.unidad}</strong>

                  <div style={{ marginTop: 5 }}>🧺 {tareas.toallas}</div>
                  <div>🛏️ {tareas.blanco}</div>

                  <input
                    type="date"
                    value={u.fecha_in || ""}
                    onChange={(e) =>
                      actualizarCampo(u.id, "fecha_in", e.target.value)
                    }
                    style={{ width: "100%", marginTop: 5 }}
                  />

                  <input
                    type="date"
                    value={u.fecha_out || ""}
                    onChange={(e) =>
                      actualizarCampo(u.id, "fecha_out", e.target.value)
                    }
                    style={{ width: "100%", marginTop: 3 }}
                  />

                  <div style={{ display: "flex", gap: 3, marginTop: 5 }}>
                    <input
                      type="number"
                      placeholder="A"
                      value={u.adultos || ""}
                      onChange={(e) =>
                        actualizarCampo(u.id, "adultos", e.target.value)
                      }
                      style={{ width: "33%" }}
                    />
                    <input
                      type="number"
                      placeholder="M"
                      value={u.menores || ""}
                      onChange={(e) =>
                        actualizarCampo(u.id, "menores", e.target.value)
                      }
                      style={{ width: "33%" }}
                    />
                    <input
                      type="number"
                      placeholder="B"
                      value={u.bebes || ""}
                      onChange={(e) =>
                        actualizarCampo(u.id, "bebes", e.target.value)
                      }
                      style={{ width: "33%" }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 5, marginTop: 5 }}>
                    <button
                      onClick={() => toggleCampo(u.id, "repaso", u.repaso)}
                    >
                      ✔
                    </button>

                    <button
                      onClick={() =>
                        toggleCampo(u.id, "mantenimiento", u.mantenimiento)
                      }
                    >
                      🛠️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
