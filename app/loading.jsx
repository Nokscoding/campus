import CampusLoaderArtwork from './components/CampusLoaderArtwork';

// Next.js only shows this fallback while a route is actually pending.
// Hide it during fast transitions; reveal the branded loader after 700 ms.
export default function Loading(){
 return <div className="campus-delayed-route-loader"><CampusLoaderArtwork variant="route"/></div>;
}
