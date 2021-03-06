import { Component } from '@angular/core';
import { VolunteerEvent } from '../../lib/model/volunteer-event';
import { VolunteerEventsService } from '../../lib/service/volunteer-events-service';
import { EventImage } from '../../lib/model/eventImage';
import { UserServices } from '../../lib/service/user';
import { EventDetailModal } from './eventdetail-modal';
import { ModalController, ViewController } from 'ionic-angular';

@Component({
  templateUrl: 'events.html',
  selector: 'events'
})

export class EventPage {

  public search: boolean = false;
  public events: Array<VolunteerEvent> = [];
  public searchedEvents: Array<VolunteerEvent> = [];
  public maxEvents: Array<VolunteerEvent> = [];
  public minEvents: Array<VolunteerEvent> = [];
  public stubEvents: Array<VolunteerEvent> = [];

  public image: Array<EventImage>;
  public val: string = "";
  public values: Array<String>;
  public searching: Boolean = false;
  public noResults: Boolean = false;
  public eventDetails: VolunteerEvent;
  public showDetails: Array<Boolean> = [];
  public moreInterval = 30;
  public moreIntervalIncrease = 30;

  constructor(public volunteerEventsService: VolunteerEventsService,
    public userServices: UserServices,
    public modalCtrl: ModalController,
    public viewCtrl: ViewController) {
  }

  ngOnInit() {

    this.loadEvents();

  }

  loadEvents() {
    let now = new Date();
    let until = new Date();
    until.setDate(now.getDate() + this.moreInterval);
    this.getEventsTimeRange(now.toISOString(), until.toISOString());
    
    //Temporarily disabling admin call until I get more GET_EVENT_DETAILS_URI
    //upon re-enabling, will need to be modified to utilize above call//

    /*
    if (this.userServices.isAdmin()) {
      //check account for admin status
      console.log("User is admin");
      this.getAdminEvents();
      //if they have admin status load admin view of events
    }
    else {
      this.getEvents();
    }
    */
  }

  showMoreEvents(){
    this.moreInterval += this.moreIntervalIncrease;
    this.loadEvents();
  }

  eventDetailModal(id) {

    let eventDetailModal = this.modalCtrl.create(EventDetailModal, {
      "id": id,
      "registered": this.amISignedUp(id)
    });
    eventDetailModal.present();
  }

  onCancel(event: any) {
    this.search = false;
  }
  getItems(ev: any) {
    if (ev.target.value == undefined) {
      ev.target.value = '';
    }
    this.searching = true;
    this.noResults = false;
    this.searchedEvents = this.events;
    // set val to the value of the searchbar
    this.val = ev.target.value;
    this.val = this.val.trim();
    this.val = this.val.toLowerCase();
    this.values = this.val.split(" ");
    if (this.val && this.val.trim() != '') {
      for (var i = 0; i < this.values.length; ++i) {
        this.searchedEvents = this.searchedEvents.filter((item) => {
          return ((item.description.toLowerCase().indexOf(this.values[i].toLowerCase()) > -1) ||
            (item.title.toLowerCase().indexOf(this.values[i].toLowerCase()) > -1) ||
            (item.location_name != null &&
              (item.location_name.toLowerCase().indexOf(this.values[i].toLowerCase()) > -1)) ||
            (item.location_address1 != null &&
              (item.location_address1.toLowerCase().indexOf(this.values[i].toLowerCase()) > -1)) ||
            (item.location_city != null &&
              (item.location_city.toLowerCase().indexOf(this.values[i].toLowerCase()) > -1)) ||
            (item.location_state != null &&
              (item.location_state.toLowerCase().indexOf(this.values[i].toLowerCase()) > -1)) ||
            (item.location_zipcode != null &&
              (item.location_zipcode.toLowerCase().indexOf(this.values[i].toLowerCase()) > -1)) ||
            (item.location_address2 != null &&
              (item.location_address2.toLowerCase().indexOf(this.values[i].toLowerCase()) > -1))
          )
        });

      }
      if (this.searchedEvents.length == 0) {
        this.noResults = true;
      }
    } else {
      this.searching = false;
    }
  }

  /* we are not displaying event pictures on the event page, this function will still be
     useful in the future for displaying pictures on the event detail view */

  /*  populateSearchedEvents(ev: VolunteerEvent[]){
      this.events = ev;
      this.searchedEvents = this.events;
      for (let event of this.events) {
       this.volunteerEventsService
          .getEventImage(event.id).subscribe(
                                 image => {this.image = image;
                                           event.image = this.image;
                                           if(this.image.length==0){
                                              this.image[0] = new EventImage();
                                              event.image = this.image;};
                                          }, 
                                  err => {
                                      console.log(err);
                                  }, 
                                  () => this.searchedEvents = this.events);
      }
    } */

  getEvents() {
    this.volunteerEventsService
      .getVolunteerEvents().subscribe(
      event => this.stubEvents = event,
      err => {
        console.log(err);
      },
      () => this.searchedEvents = this.events);
  }
  getAdminEvents() {
    this.volunteerEventsService
      .getAdminEvents().subscribe(
      event => this.stubEvents = event,
      err => {
        console.log(err);
      },
      () => {
      this.searchedEvents = this.events;
      });
  }
  getEventsMax(maxTime) {
    this.volunteerEventsService
      .getVolunteerEventsMaxTime(maxTime).subscribe(
      events => this.maxEvents = events,
      err => {
        console.log(err);
      });
  }
  getEventsMin(minTime) {
    this.volunteerEventsService
      .getVolunteerEventsMinTime(minTime).subscribe(
      events => this.minEvents = events,
      err => {
        console.log(err);
      });
  }
  getEventsTimeRange(minTime, maxTime) {
    this.volunteerEventsService
      .getVolunteerEventsTimeRange(minTime, maxTime).subscribe(
      events => this.events = events,
      err => {
        console.log(err);
      },
      () => this.searchedEvents = this.events);
  }
  amISignedUp(id) {
    //we return true if there is no user logged in, this prevents the ability
    //to sign up for an event 
    if (!this.userServices.user.id) {
      return true;
    }
    for (let i of this.volunteerEventsService.myEvents) {
      if (id == i.event_id) {
        return true;
      }
    }
    return false;
  }
  getEventDetails(id: string) {

  }
}