import get from 'axios'


export const getFile = file =>  new Promise((resolve, reject) => {
  // get(`${CONFIG.serverURL}/${file}`, {
  const base = window.location.href.split('/').slice(0, 3).join('/');
  console.log(base);
  get(`${base}/data/${file}`, {
      credentials: 'include'
    }).then(({data}) => resolve(data))
      .catch(reject)
})