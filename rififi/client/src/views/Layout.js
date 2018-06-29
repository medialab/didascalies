import React, { Component } from 'react';

import {getFile} from '../utils/client';

import PropTypes from 'prop-types';

import {
  Container,
  Navbar,
  NavbarBrand,
  NavbarItem,
  Icon,
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
    dossiers: PropTypes.array,
  }

  constructor(props) {
    super(props);
    this.state = {
      dossiers: [],
      navIsActive: false
    };
  }

  getChildContext = () => ({
    dossiers: this.state.dossiers
  })

  componentDidMount() {
    getFile('liste.txt')
      .then(str => {
        this.setState({
          dossiers: str.split('\n').map(s => s.trim())
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
        dossiers,
        navIsActive,
      },
      props: {
        children
      },
      onClickNav,

    } = this;

    return (
      <div className="Layout">
        <Navbar>
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
                      <NavbarLink href='/'>Dossiers</NavbarLink>
                      <NavbarDropdown>
                        {
                          dossiers.map((dossier, index) => {
                            return <NavbarItem href={`/dossier/${dossier}`}>{dossier}</NavbarItem>
                          })
                        }
                      </NavbarDropdown>
                  </NavbarItem>
              </NavbarStart>
              <NavbarEnd>
                  <NavbarItem href="https://github.com/medialab" isHidden='touch'>
                      <Icon className='fa fa-github' />
                  </NavbarItem>
                  <NavbarItem href="https://twitter.com/AlgusDark" isHidden='touch'>
                      <Icon className='fa fa-twitter' style={{ color: '#55acee' }} />
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
          {children}
      </div>
    );
  }
}