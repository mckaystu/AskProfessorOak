import { useParams, Link } from "react-router-dom";

const PokemonDetail = () => {
  const { name } = useParams<{ name: string }>();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card px-6 py-4 flex items-center gap-4">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Search
        </Link>
        <h1 className="text-3xl font-bold text-destructive tracking-tight capitalize">
          {name}
        </h1>
      </header>
      <main className="flex items-center justify-center p-12">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            Pokémon detail page for
          </p>
          <p className="mt-2 text-4xl font-bold capitalize text-foreground">
            {name}
          </p>
        </div>
      </main>
    </div>
  );
};

export default PokemonDetail;
