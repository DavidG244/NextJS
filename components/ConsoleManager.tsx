"use client";

import { useEffect, useState } from "react";
import Swal from "@/lib/swal";

interface ConsoleItem {
  id: number;
  name: string;
  manufacturer: string;
  releaseDate: string;
  description: string;
  _count: {
    games: number;
  };
}

interface ConsoleFormValues {
  name: string;
  manufacturer: string;
  releaseDate: string;
  description: string;
}

const initialFormValues: ConsoleFormValues = {
  name: "",
  manufacturer: "",
  releaseDate: "",
  description: "",
};

export default function ConsoleManager() {
  const [consoles, setConsoles] = useState<ConsoleItem[]>([]);
  const [formValues, setFormValues] = useState<ConsoleFormValues>(initialFormValues);
  const [selectedConsoleId, setSelectedConsoleId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConsoles();
  }, []);

  const loadConsoles = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/consoles", {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || `Status ${response.status}`);
      }

      const data = await response.json();
      setConsoles(data);
    } catch (err) {
      console.error("Error cargando consolas:", err);
      setError("No se pudieron cargar las consolas.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedConsoleId(null);
    setFormValues(initialFormValues);
    setError(null);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const { name, manufacturer, releaseDate, description } = formValues;
    if (!name.trim() || !manufacturer.trim() || !releaseDate.trim() || !description.trim()) {
      setError("Completa todos los campos requeridos.");
      setIsSaving(false);
      return;
    }

    const payload = {
      name: name.trim(),
      manufacturer: manufacturer.trim(),
      releaseDate: releaseDate.trim(),
      description: description.trim(),
    };

    try {
      const method = selectedConsoleId ? "PUT" : "POST";
      const url = selectedConsoleId ? `/api/consoles/${selectedConsoleId}` : "/api/consoles";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let responseBody: any = null;
      try {
        responseBody = await response.json();
      } catch (parseError) {
        const text = await response.text().catch(() => "");
        responseBody = { error: text || "Respuesta inválida del servidor" };
      }

      if (!response.ok) {
        const backendError = responseBody?.error;
        const message = typeof backendError === "string"
          ? backendError
          : JSON.stringify(backendError, null, 2);
        throw new Error(message || "Error en la solicitud");
      }

      await loadConsoles();
      resetForm();
      Swal.fire({
        icon: "success",
        title: selectedConsoleId ? "Consola actualizada" : "Consola creada",
        text: selectedConsoleId ? "Los datos de la consola fueron actualizados correctamente." : "La consola fue creada correctamente.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error guardando consola:", err);
      setError(String(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (consoleItem: ConsoleItem) => {
    setSelectedConsoleId(consoleItem.id);
    setFormValues({
      name: consoleItem.name,
      manufacturer: consoleItem.manufacturer,
      releaseDate: consoleItem.releaseDate.split("T")[0] || "",
      description: consoleItem.description,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (consoleItem: ConsoleItem) => {
    const result = await Swal.fire({
      title: `Eliminar ${consoleItem.name}?`,
      text: consoleItem._count.games > 0
        ? "Esta consola tiene juegos vinculados y no se puede eliminar."
        : "Este cambio no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/consoles/${consoleItem.id}`, {
        method: "DELETE",
      });
      const responseBody = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(responseBody?.error || "No se pudo eliminar la consola.");
      }

      setConsoles((current) => current.filter((item) => item.id !== consoleItem.id));
      Swal.fire({
        icon: "success",
        title: "Consola eliminada",
        text: "La consola fue eliminada correctamente.",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error eliminando consola:", err);
      Swal.fire({
        icon: "error",
        title: "No se pudo eliminar",
        text: String(err),
      });
    }
  };

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{selectedConsoleId ? "Editar consola" : "Agregar consola"}</h2>
            <p className="text-sm text-gray-500">Completa los datos para crear o actualizar una consola.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <label className="label">
              <span className="label-text">Nombre *</span>
            </label>
            <input
              type="text"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="PlayStation 5"
            />
          </div>

          <div className="space-y-3">
            <label className="label">
              <span className="label-text">Fabricante *</span>
            </label>
            <input
              type="text"
              name="manufacturer"
              value={formValues.manufacturer}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Sony"
            />
          </div>

          <div className="space-y-3">
            <label className="label">
              <span className="label-text">Fecha de lanzamiento *</span>
            </label>
            <input
              type="date"
              name="releaseDate"
              value={formValues.releaseDate}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>

          <div className="space-y-3">
            <label className="label">
              <span className="label-text">Descripción *</span>
            </label>
            <textarea
              name="description"
              value={formValues.description}
              onChange={handleChange}
              className="textarea textarea-bordered w-full"
              rows={4}
              placeholder="Detalles sobre la consola"
            />
          </div>

          {error && (
            <div className="md:col-span-2 alert alert-error shadow-lg">
              <div>{error}</div>
            </div>
          )}

          <div className="md:col-span-2 flex flex-wrap gap-3 justify-end">
            {selectedConsoleId && (
              <button type="button" onClick={resetForm} className="btn btn-outline">
                Cancelar edición
              </button>
            )}
            <button type="submit" className={`btn btn-primary ${isSaving ? "loading" : ""}`} disabled={isSaving}>
              {selectedConsoleId ? "Actualizar consola" : "Agregar consola"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Consolas existentes</h2>
            <p className="text-sm text-gray-500">Aquí puedes editar o eliminar consolas. No se pueden eliminar si tienen juegos asociados.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-sm text-gray-500">Cargando consolas...</div>
        ) : consoles.length === 0 ? (
          <div className="text-sm text-gray-500">No hay consolas registradas aún.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Fabricante</th>
                  <th>Publicación</th>
                  <th>Juegos</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {consoles.map((consoleItem) => (
                  <tr key={consoleItem.id}>
                    <td>{consoleItem.name}</td>
                    <td>{consoleItem.manufacturer}</td>
                    <td>{new Date(consoleItem.releaseDate).toLocaleDateString()}</td>
                    <td>{consoleItem._count.games}</td>
                    <td className="text-right space-x-2">
                      <button type="button" className="btn btn-xs btn-outline" onClick={() => handleEdit(consoleItem)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs btn-error"
                        onClick={() => handleDelete(consoleItem)}
                        disabled={consoleItem._count.games > 0}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
