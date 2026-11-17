export function TrafficSignImage({url}:{url?:string}){
  if(!url) return null;
  if(url.startsWith("http") || url.startsWith("data:") || url.startsWith("/")){
    return <img src={url} alt="sign" className="w-24 h-24 object-contain bg-white rounded-xl border p-2"/>
  }
  return <span className="text-6xl">{url}</span>
}
