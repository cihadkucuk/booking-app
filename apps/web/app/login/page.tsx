export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card-surface rounded-3xl p-10 w-full max-w-md">
        <h1 className="text-4xl font-display">Welcome back</h1>
        <p className="text-sm text-black/60 mt-2">Sign in to manage your studio.</p>
        <form className="mt-6 space-y-4">
          <input className="w-full p-3 rounded-xl border border-black/10" placeholder="Email" />
          <input className="w-full p-3 rounded-xl border border-black/10" placeholder="Password" type="password" />
          <input className="w-full p-3 rounded-xl border border-black/10" placeholder="Tenant ID" />
          <input className="w-full p-3 rounded-xl border border-black/10" placeholder="Studio ID" />
          <button className="w-full py-3 rounded-xl bg-ink text-white">Sign In</button>
        </form>
      </div>
    </div>
  );
}
