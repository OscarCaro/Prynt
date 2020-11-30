"use strict"

import * as Pmgr from './pmgrapi.js'

/**
 * Librería de cliente para interaccionar con el servidor de PrinterManager (prmgr).
 * Prácticas de IU 2020-21
 *
 * Para las prácticas de IU, pon aquí (o en otros js externos incluidos desde tus .htmls) el código
 * necesario para añadir comportamientos a tus páginas. Recomiendo separar el fichero en 2 partes:
 * - funciones que pueden generar cachos de contenido a partir del modelo, pero que no
 *   tienen referencias directas a la página
 * - un bloque rodeado de $(() => { y } donde está el código de pegamento que asocia comportamientos
 *   de la parte anterior con elementos de la página.
 *
 * Fuera de las prácticas, lee la licencia: dice lo que puedes hacer con él, que es esencialmente
 * lo que quieras siempre y cuando no digas que lo escribiste tú o me persigas por haberlo escrito mal.
 */

//
// PARTE 1:
// Código de comportamiento, que sólo se llama desde consola (para probarlo) o desde la parte 2,
// en respuesta a algún evento.
//

class InterfaceState {
  constructor(ciSelectedJob, imSelectedPrinter, imFilters, grSelectedGroup) {
    // State of Cola de Impresion tab
    this.ciSelectedJob = ciSelectedJob;

    // State of Impresoras tab
    this.imSelectedPrinter = imSelectedPrinter;
    this.imFilters = imFilters || [];

    // State of Grupos tab
    this.grSelectedGroup = grSelectedGroup;
  }
}

let interfaceState = undefined;  // Initialized on update(), declared here for global access 


function statusToSVG(state, desiredSize) {
  const PS = Pmgr.PrinterStates;
  switch (state) {
    case PS.PRINTING:
      // Source: https://icons.getbootstrap.com/
      return `
      <svg width="${desiredSize}em" height="${desiredSize}em" viewBox="0 0 16 16" class="bi bi-printer-fill"
          fill="dark" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2H5z" />
        <path fill-rule="evenodd"
            d="M11 9H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z" />
        <path fill-rule="evenodd"
            d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2V7zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
      </svg> <!-- icono impresora -->
      `;
      break;

    case PS.PAUSED:
      // Source: https://icons.getbootstrap.com/
      return `
      <svg width="${desiredSize}em" height="${desiredSize}em" viewBox="0 0 16 16" class="bi bi-pause-fill" 
          fill="dark" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
      </svg>  <!-- icono paused -->
          `;
      break;

    case PS.NO_INK:
      // Source: https://icons.getbootstrap.com/
      return `
      <svg width="${desiredSize}em" height="${desiredSize}em" viewBox="0 0 16 16" class="bi bi-droplet-half" 
          fill="dark" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" d="M7.21.8C7.69.295 8 0 8 0c.109.363.234.708.371 1.038.812 1.946 2.073 3.35 3.197 4.6C12.878 7.096 14 8.345 14 10a6 6 0 0 1-12 0C2 6.668 5.58 2.517 7.21.8zm.413 1.021A31.25 31.25 0 0 0 5.794 3.99c-.726.95-1.436 2.008-1.96 3.07C3.304 8.133 3 9.138 3 10c0 0 2.5 1.5 5 .5s5-.5 5-.5c0-1.201-.796-2.157-2.181-3.7l-.03-.032C9.75 5.11 8.5 3.72 7.623 1.82z"/>
        <path fill-rule="evenodd" d="M4.553 7.776c.82-1.641 1.717-2.753 2.093-3.13l.708.708c-.29.29-1.128 1.311-1.907 2.87l-.894-.448z"/>
      </svg>  <!-- icono no-ink -->
          `;
      break;

    case PS.NO_PAPER:
      // Source: https://icons.getbootstrap.com/
      return `
      <svg width="${desiredSize}em" height="${desiredSize}em" viewBox="0 0 16 16" class="bi bi-file-earmark-excel-fill" 
          fill="dark" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" d="M2 2a2 2 0 0 1 2-2h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm7.5 1.5v-2l3 3h-2a1 1 0 0 1-1-1zM5.884 6.68a.5.5 0 1 0-.768.64L7.349 10l-2.233 2.68a.5.5 0 0 0 .768.64L8 10.781l2.116 2.54a.5.5 0 0 0 .768-.641L8.651 10l2.233-2.68a.5.5 0 0 0-.768-.64L8 9.219l-2.116-2.54z"/>
      </svg> 
          `;
      break;

    default:

  }
}

function getPrinterGroups(group) {
  for (let i = 0; i < Pmgr.globalState.groups.length; i++) {
    if (Pmgr.globalState.groups[i].id == group.id) {
      return Pmgr.globalState.groups[i].printers;
    }
  }
}

function getPrinterJobs(printer) {
  return printer.queue.map((jId) => Pmgr.globalState.jobs.find((j) => j.id == jId));
}

function createPrinterItem(printer) {
  const rid = 'x_' + Math.floor(Math.random() * 1000000);
  const hid = 'h_' + rid;
  const cid = 'c_' + rid;

  let printerJobs = getPrinterJobs(printer);
  let printerJobsFormatted;

  if (printerJobs.length <= 5) {
    printerJobsFormatted = printerJobs
      .map((j) => `<span class="badge badge-secondary">${j.fileName}</span>`)
      .join(" ");
  }
  else {
    let numExtra = printerJobs.length - 5;

    printerJobsFormatted = printerJobs
      .slice(0, 5)
      .map((j) => `<span class="badge badge-secondary">${j.fileName}</span>`)
      .join(" ");

    printerJobsFormatted += (` <span class="badge badge-secondary">${"+" + numExtra}</span>`);
    /* Explanation:
        - slice => returns subarray from 0 to 5 (discard the rest of the jobs)
        - map   => takes each item (a job) and puts the job fileName in html
        - join  => converts array of html items into a single string of html
        - +=    => inserts the last element (the "+numExtra") as a string to the long html string
    */
  }

  return `
    <div class="card">
      <div class="card-header" id="${printer.id}" onclick="updateImDer(this)">
        <h2 class="mb-0">
        <button class="btn w-100" type="button"
                data-toggle="collapse" data-target="#${cid}",
                aria-expanded="false" aria-controls="#${rid}">
          <div class="row w-100 ">
            <div class="col h-100 my-auto">
              <h3>
                <div class="pcard">
                  ${printer.alias}
                </div>
              </h3>
            </div>

            <div class="col h-100 my-auto">  
              <div class="float-right">            
                  ${statusToSVG(printer.status, 2)}
              </div>
            </div>
          </div>
        </button>
        </h2>
      </div>

      <div id="${cid}" class="collapse hide" aria-labelledby="${hid}
        data-parent="#imIzLista">
        <div class="card-body pcard">
          ${printerJobsFormatted}
        </div>
      </div>
    </div >
        `;
}

function createJobItem(job) {

  let totalPrinters = Pmgr.globalState.printers;
  let printing;

  for (let ij = 0; ij < totalPrinters.length; ij++) {
    if (totalPrinters[ij].id == job.printer) {
      printing = totalPrinters[ij].queue[0] == job.id;
    }
  }

  return `
      <div class="card" id="${job.id}" onclick="updateCiDer(this)">
        <div class="row">
            <div class="col-9">
            ${job.fileName}
            </div>
            ${printing ? `
              <div class="col">
                  <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-printer-fill"
                                    fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2H5z" />
                                    <path fill-rule="evenodd"
                                        d="M11 9H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z" />
                                    <path fill-rule="evenodd"
                                        d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2V7zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                  </svg> <!-- icono impresora -->
                </div>`: " "
    }
               
            
        </div>
    </div>
  `;
}

function createGroupItem(group) {
  const rid = 'x_' + Math.floor(Math.random() * 1000000);
  const hid = 'h_' + rid;
  const cid = 'c_' + rid;

  let printersGroup = getPrinterGroups(group);
  let printersGroupsFormatted;

  if (printersGroup <= 5) {
    printersGroupsFormatted = printersGroup
      .map((j) => `<span class="badge badge-secondary">${Pmgr.globalState.printers[j].alias}</span>`)
      .join(" ");
  }
  else {
    let numExtra = printersGroup.length - 5;

    printersGroupsFormatted = printersGroup
      .slice(0, 5)
      .map((j) => `<span class="badge badge-secondary">${Pmgr.globalState.printers[j].alias}</span>`)
      .join(" ");

    printersGroupsFormatted += (` <span class="badge badge-secondary">${"+" + numExtra}</span>`);
  }

  return `
    <div class="card">
      <div class="card-header" id="${group.name}" onclick="updateGrDer(this)">
        <h2 class="mb-0">
        <button class="btn w-100" type="button"
                data-toggle="collapse" data-target="#${cid}",
                aria-expanded="false" aria-controls="#${rid}">
          <div class="row w-100 ">
            <div class="col h-100 my-auto">
              <h3>
                <div class="pcard">
                  ${group.name}
                </div>
              </h3>
            </div>
          </div>
        </button>
        </h2>
      </div>

      <div id="${cid}" class="collapse hide" aria-labelledby="${hid}
        data-parent="#imIzLista">
        <div class="card-body pcard">
          ${printersGroupsFormatted}
        </div>
      </div>
    </div >
        `;

}

function updateCiDer(doc) {

  interfaceState.ciSelectedJob = doc;

  let nameDoc, idDoc, ownerDoc, printerDoc;

  idDoc = doc.id;
  let totalJobs = Pmgr.globalState.jobs;


  for (let ij = 0; ij < totalJobs.length; ij++) {
    if (totalJobs[ij].id == idDoc) {
      nameDoc = totalJobs[ij].fileName;
      ownerDoc = totalJobs[ij].owner
      printerDoc = totalJobs[ij].printer;
    }
  }

  $("#ciDerDatos").html(
    `<div class="col-6" align="center">
          <div class="row-4" style="font-size:xxx-large;">
              <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-printer-fill"
                  fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2H5z" />
                  <path fill-rule="evenodd"
                      d="M11 9H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z" />
                  <path fill-rule="evenodd"
                      d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2V7zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
              </svg> <!-- icono impresora -->

              <!-- nombre archivo -->
              ${nameDoc}
          </div>
          <div class="row-4" style="font-size:x-large;">
              ID: ${idDoc}
              <br>Propietario: ${ownerDoc}
              <br>Impresora: ${printerDoc}
          </div>
          <div class="row-4">
              <br><button class="btn btn-primary" type="button" data-toggle="modal"
                  data-target="#dialogoCancelarImpresión">Cancelar impresión</button>

              <div class="modal fade" id="dialogoCancelarImpresión" tabindex="-1"
                  role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                  <div class="modal-dialog" role="document">
                      <div class="modal-content">
                          <div class="modal-header">
                              <h5 class="modal-title" id="exampleModalLabel">
                                  Cancelar impresión</h5>
                              <button type="button" class="close" data-dismiss="modal"
                                  aria-label="Close">
                                  <span aria-hidden="true">&times;</span>
                              </button>
                          </div>
                          <div class="modal-body">
                              <form class="form-inline">
                                  <h6> ¿Estás seguro/a de que deseas cancelar este
                                      trabajo?
                                  </h6>

                              </form>
                          </div>
                          <div class="modal-footer">
                              <button type="button" class="btn btn-secondary"
                                  data-dismiss="modal">Atrás</button>
                              <button type="button" class="btn btn-danger">Cancelar
                                  impresión</button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      <!-- pdf embed -->
      <div class="col-6">
          <div class="embed-responsive embed-responsive-210by297">
              <object class="embed-responsive-item" data="manual.pdf"
                  type="application/pdf" internalinstanceid="9" title="">
                  <object data="manual.pdf" type="application/pdf" internalinstanceid="9"
                      title="">
                      <p>
                          Your browser isn't supporting embedded pdf files.
                          You can download the file
                          <a href="manual.pdf">here</a>.
                      </p>
                  </object>
              </object>
          </div>
   </div>
  `);
}

function updateImDer(printer) {

  interfaceState.imSelectedPrinter = printer.id;

  let printerId = printer.id;
  let totalPrinters = Pmgr.globalState.printers;
  let printerName, printerModel, printerLoc, printerStatus;


  for (let ij = 0; ij < totalPrinters.length; ij++) {
    if (totalPrinters[ij].id == printerId) {
      printerName = totalPrinters[ij].alias;
      printerModel = totalPrinters[ij].model;
      printerLoc = totalPrinters[ij].location;
      printerStatus = totalPrinters[ij].status;
    }
  }

  $("#imDerDatos").html(
    `
    <div class="col">
    <div class="row-4">
        <div class="row">
            <div class="col-9">
                <h2>
                    <!-- nombre archivo -->
                    ${printerName}

                    <!-- icono editar -->
                    <button type="button" data-toggle="modal"
                        data-target="#dialogoEditarImpresora">
                        <svg width="1em" height="1em" viewBox="0 0 16 16"
                            class="bi bi-pencil-square" fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                            <path fill-rule="evenodd"
                                d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                        </svg>
                    </button>
                </h2>

                <!-- Dialogo Modal Editar impresora -->
                <div class="modal fade" id="dialogoEditarImpresora" tabindex="-1"
                    role="dialog" aria-labelledby="exampleModalLabel"
                    aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="exampleModalLabel">
                                    Editar impresora</h5>
                                <button type="button" class="close" data-dismiss="modal"
                                    aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <form class="form-inline">
                                    <h6> <b>Nombre:</b></h6>
                                    <div class="form-group mx-sm-3 mb-2">
                                        <label for="inputNewName"
                                            class="sr-only">NuevoNombre</label>
                                        <input type="text"
                                            class="form-control-plaintext"
                                            id="inputNewName" placeholder="Impresora">
                                    </div>
                                </form>

                                <form class="form-inline">
                                    <h6> <b>IP:</b></h6>
                                    <div class="form-group mx-sm-3 mb-2">
                                        <label for="inputEditIP"
                                            class="sr-only">NuevaIP</label>
                                        <input type="text"
                                            class="form-control-plaintext"
                                            id="inputEditIP" placeholder="192.168.1.0">
                                    </div>
                                </form>

                                <form class="form-inline">
                                    <h6> <b>Modelo:</b></h6>
                                    <div class="form-group mx-sm-3 mb-2">
                                        <label for="inputEditModel"
                                            class="sr-only">NuevoModelo</label>
                                        <input type="text"
                                            class="form-control-plaintext"
                                            id="inputEditModel" placeholder="">
                                    </div>
                                </form>

                                <form class="form-inline">
                                    <h6> <b>Localización:</b></h6>
                                    <div class="form-group mx-sm-3 mb-2">
                                        <label for="inputNewLocation"
                                            class="sr-only">NuevaLocalizacion</label>
                                        <input type="text"
                                            class="form-control-plaintext"
                                            id="inputNewLocation" placeholder="">
                                    </div>
                                </form>


                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary"
                                    data-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-primary">Editar
                                    impresora</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <div class="col">
                <p>
                    <!-- boton eliminar impresora -->
                    <br><button class="btn btn-primary" type="button"
                        data-toggle="modal"
                        data-target="#dialogoEliminarImpresora">Eliminar
                        impresora</button>

                <div class="modal fade" id="dialogoEliminarImpresora" tabindex="-1"
                    role="dialog" aria-labelledby="exampleModalLabel"
                    aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="exampleModalLabel">
                                    Eliminar impresora</h5>
                                <button type="button" class="close" data-dismiss="modal"
                                    aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <form class="form-inline">
                                    <h6> ¿Estás seguro/a de que deseas eliminar la
                                        impresora? Esta acción no se puede deshacer</h6>

                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary"
                                    data-dismiss="modal">Cancelar</button>
                                <button type="button"
                                    class="btn btn-danger">Eliminar</button>
                            </div>
                        </div>
                    </div>
                </div>
                </p>
                <p></p>
            </div>
        </div>

        <div class="row">
            <div class="col-2">
                <!-- icono impresora -->
                ${statusToSVG(printerStatus, 4)}
            </div>
            <div class="col">
                <!-- datos impresora -->
                <h4>Modelo: ${printerModel}
                    <br>Localización: ${printerLoc}
                </h4>
            </div>
        </div>
    </div>

    <br>
    <br>
    <br>

    <!-- barra de filtrado -->
    <div class="row">
        <div class="col">
            <input class="form-control mr-sm-2" type="search" placeholder="Filtrar"
                aria-label="Search">
        </div>
        <div class="col-2">
            <button class="btn btn-primary" type="submit">Filtrar</button>
        </div>
    </div>

    <p></p>

    <div class="row-4">
        <h3>Incluidas en grupos</h3>
        <script>
            
        </script>

    </div>
    <div class="row-4">
        <br>
        <h3>Grupos a los que añadir</h3>
        <script>
            
        </script>
    </div>
</div>
`);

}

function updateGrDer(group) {

  interfaceState.grSelectedGroup = group;

  $("#grDerDatos").html(
    `
    <div class="col">
    <div class="row-4">
        <div class="row">
            <div class="col-9">
                <h2>
                    <!-- nombre grupo -->
                    ${group.id}

                    <!-- icono editar -->
                    <button type="button" data-toggle="modal"
                        data-target="#dialogoEditarGrupo">
                        <svg width="1em" height="1em" viewBox="0 0 16 16"
                            class="bi bi-pencil-square" fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                            <path fill-rule="evenodd"
                                d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                        </svg>
                    </button>
                </h2>

                <!-- Dialogo Modal Editar Grupo -->
                <div class="modal fade" id="dialogoEditarGrupo" tabindex="-1"
                    role="dialog" aria-labelledby="exampleModalLabel"
                    aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="exampleModalLabel">
                                    Editar grupo ${group.id}</h5>
                                <button type="button" class="close" data-dismiss="modal"
                                    aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <form class="form-inline">
                                    <h6> <b>Nombre:</b></h6>
                                    <div class="form-group mx-sm-3 mb-2">
                                        <label for="inputEditGroupName"
                                            class="sr-only">NuevoNombre</label>
                                        <input type="text"
                                            class="form-control-plaintext"
                                            id="inputEditGroupName" placeholder="${group.id}">
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary"
                                    data-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-primary">Editar
                                    grupo</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <div class="col">
                <p>
                    <!-- boton eliminar grupo -->
                    <br><button class="btn btn-primary" type="button"
                        data-toggle="modal"
                        data-target="#dialogoEliminarGrupo">Eliminar
                        grupo</button>

                <div class="modal fade" id="dialogoEliminarGrupo" tabindex="-1"
                    role="dialog" aria-labelledby="exampleModalLabel"
                    aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="exampleModalLabel">
                                    Eliminar grupo ${group.id}</h5>
                                <button type="button" class="close" data-dismiss="modal"
                                    aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <form class="form-inline">
                                    <h6> ¿Estás seguro/a de que deseas eliminar el
                                        grupo ${group.id}? Esta acción no se puede deshacer</h6>

                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary"
                                    data-dismiss="modal">Cancelar</button>
                                <button type="button"
                                    class="btn btn-danger">Eliminar</button>
                            </div>
                        </div>
                    </div>
                </div>
                </p>
                <p></p>
            </div>
        </div>
    </div>

    <br>
    <br>
    <br>

    <!-- barra de filtrado -->
    <div class="row">
        <div class="col-8">
            <input class="form-control mr-sm-2" type="search" placeholder="Filtrar"
                aria-label="Search">
        </div>
        <div class="col">
            <select class="browser-default custom-select">
                <option selected="1">Nombre</option>
                <option value="2">Localizacion</option>
                <option value="3">ID</option>
            </select>
        </div>
        <div class="col-2">
            <button class="btn btn-primary" type="submit">Filtrar</button>
        </div>
    </div>
    <p></p>

    <!-- opciones añadidas de filtrado -->
    <button type="button" class="btn btn-secondary btn-sm">Localización: Pepe
        ×</button>
    <button type="button" class="btn btn-secondary btn-sm">Grupo: Salón ×</button>
    <p></p>

    <div class="row-4">
        <h3>Incluidas en grupos</h3>
        <script>
            
        </script>
    </div>
    <div class="row-4">
        <br>
        <h3>Grupos a los que añadir</h3>
        <script>
            
        </script>
    </div>
</div>
`);

}

// funcion para generar datos de ejemplo: impresoras, grupos, trabajos, ...
// se puede no-usar, o modificar libremente
async function populate(minPrinters, maxPrinters, minGroups, maxGroups, jobCount) {
  const U = Pmgr.Util;

  // genera datos de ejemplo
  minPrinters = minPrinters || 10;
  maxPrinters = maxPrinters || 20;
  minGroups = minGroups || 1;
  maxGroups = maxGroups || 3;
  jobCount = jobCount || 100;
  let lastId = 0;

  let printers = U.fill(U.randomInRange(minPrinters, maxPrinters),
    () => U.randomPrinter(lastId++));

  let groups = U.fill(U.randomInRange(minPrinters, maxPrinters),
    () => U.randomGroup(lastId++, printers, 50));

  let jobs = [];
  for (let i = 0; i < jobCount; i++) {
    let p = U.randomChoice(printers);
    let j = new Pmgr.Job(lastId++,
      p.id,
      [
        U.randomChoice([
          "Alice", "Bob", "Carol", "Daryl", "Eduardo", "Facundo", "Gloria", "Humberto"]),
        U.randomChoice([
          "Fernández", "García", "Pérez", "Giménez", "Hervás", "Haya", "McEnroe"]),
        U.randomChoice([
          "López", "Gutiérrez", "Pérez", "del Oso", "Anzúa", "Báñez", "Harris"]),
      ].join(" "),
      U.randomString() + ".pdf");
    p.queue.push(j.id);
    jobs.push(j);
  }

  if (Pmgr.globalState.token) {
    console.log("Updating server with all-new data");

    // FIXME: remove old data
    // FIXME: prepare update-tasks
    let tasks = [];
    for (let t of tasks) {
      try {
        console.log("Starting a task ...");
        await t().then(console.log("task finished!"));
      } catch (e) {
        console.log("ABORTED DUE TO ", e);
      }
    }
  } else {
    console.log("Local update - not connected to server");
    Pmgr.updateState({
      jobs: jobs,
      printers: printers,
      groups: groups
    });
  }
}

//
// PARTE 2:
// Código de pegamento, ejecutado sólo una vez que la interfaz esté cargada.
// Generalmente de la forma $("selector").cosaQueSucede(...)
//

$(function () {

  // funcion de actualización de ejemplo. Llámala para refrescar interfaz
  function update(result) {
    try {
      // vaciamos un contenedor
      $("#imIzLista").empty();
      $("#grIzLista").empty();
      // y lo volvemos a rellenar con su nuevo contenido
      Pmgr.globalState.jobs.forEach(j => $("#ciIzLista").append(createJobItem(j)));
      Pmgr.globalState.printers.forEach(m => $("#imIzLista").append(createPrinterItem(m)));
      Pmgr.globalState.groups.forEach(g => $("#grIzLista").append(createGroupItem(g)));
      // y asi para cada cosa que pueda haber cambiado

      // Inicializar interfaceState
      if (interfaceState == undefined) {
        // Primer elemento de cada lista seleccionado + 0 filtros
        interfaceState = new InterfaceState(Pmgr.globalState.jobs[0], Pmgr.globalState.printers[0], [], Pmgr.globalState.groups[0]);
      }

      // Rellenar panel de la derecha con el elemento seleccionado en cada pestaña
      updateCiDer(interfaceState.ciSelectedJob);
      updateImDer(interfaceState.imSelectedPrinter);
      updateGrDer(interfaceState.grSelectedGroup);

    } catch (e) {
      console.log('Error actualizando', e);
    }
  }


  // Servidor a utilizar. También puedes lanzar tú el tuyo en local (instrucciones en Github)
  const serverUrl = "http://localhost:8080/api/";
  Pmgr.connect(serverUrl);

  // ejemplo de login
  Pmgr.login("HDY0IQ", "cMbwKQ").then(d => {
    if (d !== undefined) {
      const u = Gb.resolve("HDY0IQ");
      console.log("login ok!", u);
    } else {
      console.log(`error en login(revisa la URL: ${serverUrl}, y verifica que está vivo)`);
      console.log("Generando datos de ejemplo para uso en local...")

      populate();
      update();
    }
  });
});

// cosas que exponemos para usarlas desde la consola
window.populate = populate
window.Pmgr = Pmgr;
window.createPrinterItem = createPrinterItem
window.createGroupItem = createGroupItem
window.updateCiDer = updateCiDer
window.updateImDer = updateImDer
window.updateGrDer = updateGrDer
window.statusToSVG = statusToSVG

