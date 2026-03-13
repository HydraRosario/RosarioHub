export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ArtistHub Factory (Admin Dashboard)
          </h1>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-2xl font-semibold mb-2">
              Panel de Administración
            </h2>
            <p className="text-gray-500 max-w-lg mb-6">
              Este es tu espacio central. Aquí podrás dar de alta nuevos artistas, asignarles sus links, temas (Soft Trap, Techno, etc.) y visualizar las métricas históricas ("Analytics Profesionales") de todos tus clientes.
            </p>
            <button className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition">
              + Crear Nuevo Artista
            </button>
            <p className="text-sm text-gray-400 mt-4">
              Cada nuevo perfil que crees, automáticamente obtendrá su propio subdominio inteligente.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
