const GRAFANA_URL =  import.meta.env.GRAFANA_URL;

export default function Dashboard () {
  return (
    <iframe
      src={GRAFANA_URL}
      width="100%"
      height="800"
    ></iframe>
  );
}