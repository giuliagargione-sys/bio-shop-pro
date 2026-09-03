import { Helmet } from "react-helmet-async";

const SITE_URL = "https://bioquevende.app";

type PageMetaProps = {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
};

/** Metadados por rota (title, description, canonical e og:*). */
export function PageMeta({ title, description, path, noindex }: PageMetaProps) {
  const url = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : null}
    </Helmet>
  );
}
