import React, { Component } from 'react';

import {getFile} from '../utils/client';

import PropTypes from 'prop-types';

import {Link} from 'react-router-dom';

import {
  Container,
  Navbar,
  NavbarBrand,
  NavbarItem,
  Icon,
  Input,
  Control,
  Button,
  Field,
  NavbarBurger,
  NavbarMenu,
  NavbarStart,
  NavbarEnd,
  NavbarLink,
  Level,
  NavbarDropdown,
  NavbarDivider
} from 'bloomer';

export default class Layout extends Component {

  static childContextTypes = {
    dossiers: PropTypes.object,
    listeDeputes: PropTypes.array,
    placesAssemblee: PropTypes.object,
    groupes: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = {
      dossiers: {},
      listeDeputes: undefined,
      placesAssemblee: undefined,
      groupes: undefined,
      navIsActive: false,
      searchTerm: ''
    };
  }

  getChildContext = () => ({
    dossiers: this.state.dossiers,
    listeDeputes: this.state.listeDeputes,
    placesAssemblee: this.state.placesAssemblee,
    groupes: this.state.groupes,
  })

  componentDidMount() {
    getFile('/liste_dossiers.json')
      .then(dossiers => {
        this.setState({
          dossiers
        })
      })
      .catch(console.error)
    getFile('/resources/liste-deputes.json')
      .then(({deputes: listeDeputes}) => {
        this.setState({
          listeDeputes 
        })
      })
      .catch(console.error)
    getFile('/resources/places_assemblee.json')
      .then(placesAssemblee => {
        this.setState({
          placesAssemblee 
        })
      })
      .catch(console.error)
    getFile('/resources/groupes.json')
      .then(groupes => {
        this.setState({
          groupes: groupes.organismes.reduce((result, orga) => ({
            ...result,
            [orga.organisme.acronyme]: orga.organisme
          }), {}) 
        })
      })
      .catch(console.error)
  }

  onClickNav = () => {
    this.setState({
      navIsActive: !this.state.navIsActive
    })
  }

  render = () => {
    const {
      state: {
        dossiers = {},
        navIsActive,
        searchTerm = ''
      },
      props: {
        children
      },
      onClickNav,

    } = this;

    const dossiersList = Object.keys(dossiers).map(key => dossiers[key]).filter(d => d);
    return (
      <div className="Layout">
        <Navbar style={{position: 'fixed', top: 0, left: 0, width: '100%'}}>
          <NavbarBrand>
              <NavbarItem isHidden='desktop'>
                  <Icon className='fa fa-github' />
              </NavbarItem>
              <NavbarItem isHidden='desktop'>
                  <Icon className='fa fa-twitter' style={{ color: '#55acee' }} />
              </NavbarItem>
              <NavbarBurger isActive={this.state.navIsActive} onClick={this.onClickNav} />
          </NavbarBrand>
          <NavbarMenu isActive={this.state.navIsActive} onClick={this.onClickNav}>
              <NavbarStart>
                  <NavbarItem href='/'>Du rififi à l'assemblée</NavbarItem>
                  <NavbarItem hasDropdown isHoverable>
                      <NavbarItem>Accéder à un dossier</NavbarItem>
                      <NavbarDropdown  style={{maxHeight: '20rem', overflow: 'auto'}}>
                        <NavbarItem>
                          <Input value={searchTerm} onChange={e => this.setState({searchTerm: e.target.value})} />
                        </NavbarItem>
                        {
                          dossiersList
                          .filter(d => {
                            return d.nom && d.nom.toLowerCase().indexOf(searchTerm) > -1
                          })
                          .map((dossier, index) => {
                            return <NavbarItem 
                                    key={index} 
                                    >
                                      <Link to={`/dossier/${dossier.id}`}>
                                        {dossier.nom}
                                      </Link>
                                    </NavbarItem>
                          })
                        }
                      </NavbarDropdown>
                  </NavbarItem>
                  <NavbarItem><Link to={'/liste'}>Tous les dossiers</Link></NavbarItem>
                  <NavbarItem><Link to={'/acteurs'}>Tous les acteurs</Link></NavbarItem>
                  <NavbarItem><Link to={'/methodologie'}>Méthodologie</Link></NavbarItem>
                  <NavbarItem><Link to={'/a-propos'}>À propos</Link></NavbarItem>

              </NavbarStart>
              <NavbarEnd>
                  <NavbarItem href="https://github.com/medialab/didascalies" isHidden='touch'>
                      <Icon className='fa fa-github' />
                  </NavbarItem>
                  <NavbarItem>
                      <Field isGrouped>
                          <Control>
                              <Button id="twitter" data-social-network="Twitter" data-social-action="tweet"
                              data-social-target="http://medialab.sciencespo.fr" target="_blank" href="https://twitter.com/intent/tweet?text=du rififi à l'assemblée - médialab SciencesPo">
                                  <Icon className="fa fa-twitter" />
                                  <span>Gazouiller</span>
                              </Button>
                          </Control>
                      </Field>
                  </NavbarItem>
              </NavbarEnd>
          </NavbarMenu>
          </Navbar>
          <Level/>
          <Level/>
          <Level/>
          <div id="container">
            {children}
          </div>
      </div>
    );
  }
}