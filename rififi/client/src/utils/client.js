import get from 'axios'


export const getFile = file =>  new Promise((resolve, reject) => {
  get(`${CONFIG.serverURL}/${file}`, {
      credentials: 'include'
    }).then(({data}) => resolve(data))
      .catch(reject)
})