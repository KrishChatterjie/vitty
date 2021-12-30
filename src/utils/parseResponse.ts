import { monTimings, tueTimings, wedTimings, thuTimings, friTimings } from '../constants/timings'
import { courses } from '../constants/courses'

let monSlots: any[] = []
let tueSlots: any[] = []
let wedSlots: any[] = []
let thuSlots: any[] = []
let friSlots: any[] = []

export const parseAndUpload = (arr: any[]): any => {
  parseText(arr)
  addDetails(monSlots, monTimings)
  addDetails(tueSlots, tueTimings)
  addDetails(wedSlots, wedTimings)
  addDetails(thuSlots, thuTimings)
  addDetails(friSlots, friTimings)
  monSlots = parseObject(monSlots, monTimings)
  tueSlots = parseObject(tueSlots, tueTimings)
  wedSlots = parseObject(wedSlots, wedTimings)
  thuSlots = parseObject(thuSlots, thuTimings)
  friSlots = parseObject(friSlots, friTimings)
  return [monSlots, tueSlots, wedSlots, thuSlots, friSlots]
}

const parseText = (arr: any[]): any => {
  if (arr.length === 0) return []
  const filledSlots: string[] = []
  arr.forEach((el) => {
    const slot = el.Slot
    if (!filledSlots.includes(slot)) {
      filledSlots.push(slot)
      if (Object.prototype.hasOwnProperty.call(monTimings, slot)) monSlots.push(el)
      if (Object.prototype.hasOwnProperty.call(tueTimings, slot)) tueSlots.push(el)
      if (Object.prototype.hasOwnProperty.call(wedTimings, slot)) wedSlots.push(el)
      if (Object.prototype.hasOwnProperty.call(thuTimings, slot)) thuSlots.push(el)
      if (Object.prototype.hasOwnProperty.call(friTimings, slot)) friSlots.push(el)
    }
  })
  // console.log('Monday', monSlots)
  // console.log('Tuesday', tueSlots)
  // console.log('Wednesday', wedSlots)
  // console.log('Thursday', thuSlots)
  // console.log('Friday', friSlots)
}

const changeTimezone = (date: Date, ianatz: string): Date => {
  const invdate = new Date(date.toLocaleString('en-US', { timeZone: ianatz }))
  const diff = date.getTime() - invdate.getTime()
  return new Date(date.getTime() - diff)
}

const addMinutes = (date: Date, minutes: number): Date => new Date(date.getTime() + minutes * 60000)

const nullCheck = (x: any): any => (x == null ? '' : x)

const addDetails = (daySlots: any[], timings: {[slot: string]: string}): void => {
  daySlots.forEach((el) => {
    // calculating timings
    let startTime = new Date('April 1 2021 ' + timings[el.Slot] + ':00+05:30')
    let endTime: Date
    if (el.Course_type === 'Lab') endTime = addMinutes(startTime, 100)
    else endTime = addMinutes(startTime, 50)
    startTime = changeTimezone(startTime, Intl.DateTimeFormat().resolvedOptions().timeZone)
    endTime = changeTimezone(endTime, Intl.DateTimeFormat().resolvedOptions().timeZone)

    // calculating course name
    let courseName: string
    if (courses[el.Course_Name] === undefined) courseName = el.Course_Name
    else courseName = courses[el.Course_Name]
    el.courseName = nullCheck(courseName)
    el.startTime = startTime
    el.endTime = endTime
  })
}

const parseObject = (daySlots: any[], timings: {[slot: string]: string}): any[] => {
  const newSlots: any[] = []

  daySlots.forEach((el) => {
    // reparsing object properly
    const newEl = {
      slot: '',
      courseCode: '',
      courseType: '',
      courseName: '',
      location: '',
      startTime: new Date(),
      endTime: new Date()
    }
    newEl.slot = nullCheck(el.Slot)
    newEl.courseCode = nullCheck(el.Course_Name)
    newEl.courseType = nullCheck(el.Course_type)
    newEl.location = nullCheck(el.Venue)
    newEl.courseName = el.courseName
    newEl.startTime = el.startTime
    newEl.endTime = el.endTime

    newSlots.push(newEl)

    // WHY DOESNT THIS JUST WORK
    // delete el.Slot
    // delete el.Course_Name
    // delete el.Course_type
    // delete el.Venue
  })

  newSlots.sort((a, b) => (timings[a.Slot] > timings[b.Slot] ? 1 : -1))
  return newSlots
}
