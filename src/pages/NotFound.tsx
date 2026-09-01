import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
      <h1 className="text-3xl font-bold">Página não encontrada</h1>
      <p className="text-muted-foreground">Confira o endereço e tente novamente.</p>
      <Link to="/" className="text-primary underline">
        Voltar para a loja
      </Link>
    </div>
  );
}
