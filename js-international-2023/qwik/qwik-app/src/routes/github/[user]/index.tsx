import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";

export const useRepos = routeLoader$(async () => {
  console.log('loading repos');
  return ['abc', 'xyz'];
});

export default component$(() => {
  const repos = useRepos();
  return (<div>
    <div>
      {repos.value.map((repo, idx) => 
        <span key={idx}>repo</span>
      )}
    </div>
  </div>)
})