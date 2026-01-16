export interface PoliceContact {
  rank: string;
  name: string;
  section: string;
  sectionOther?: string;
}

export interface WitnessedAction {
  action: "fingerprinting" | "photographing" | "searching" | "dna";
  witnessed: "yes" | "no" | "didntWitnessButTold";
  consent: "consent" | "withoutConsent";
}

export interface InterviewOfficer {
  rank: string;
  badgeNumber: string;
  name: string;
}

export interface InterviewTimes {
  commenced: string;
  suspended: string;
  recommenced: string;
  reasonForSuspension: string;
  concluded: string;
}

export interface ImmediateNeed {
  type: string;
  required: boolean;
  provided: boolean;
  notProvided: boolean;
  other?: string;
}

export interface YRIPPFormData {
  sectionA: {
    independentPersonName: string;
    independentPersonNumber?: string;
    policeStation: string;
    interviewDate: string;
    callTime: string;
    policeContact: PoliceContact;
    arrivalTime: string;
    parentNotAttendingReason: string[];
    parentNotAttendingOther?: string;
    custodyDuration: string;
    mainOffenceTypes: {
      crimesAgainstPerson: string[];
      crimesAgainstPersonOther?: string;
      drugs: string[];
      drugsOther?: string;
      crimesAgainstProperty: string[];
      crimesAgainstPropertyOther?: string;
      other: string[];
      otherOther?: string;
    };
    offenceOccurredInDHHS: "yes" | "no" | "";
  };

  sectionBPartA: {
    preferredFirstName: string;
    immediateNeeds: ImmediateNeed[];
    satisfiedWithPoliceTreatment: "yes" | "no" | "";
    policeTreatmentConcerns: string[];
    policeTreatmentConcernsOther?: string;
    actionRequired: "yes" | "no" | "";
    actionDetails?: string;
    injuries?: string;
    gender: "male" | "female" | "other" | "";
    genderOther?: string;
    age: string;
    dateOfBirth: string;
    livingArrangement: string;
    countryOfBirth: string;
    culturalIdentity: string;
    isATSI: "yes" | "no" | "";
    valsContacted: "yes" | "no" | "";
    valsNotContactedReason?: string;
    englishFirstLanguage: "yes" | "no" | "";
    otherLanguages: string;
    previousPoliceInterviews: "yes" | "no" | "";
    ypConcernsAboutPoliceTreatment: string[];
    ypConcernsAboutPoliceTreatmentOther?: string;
    ypActionWanted: string[];
    ypActionWantedOther?: string;
  };

  sectionC: {
    opportunityToTalkPrivate: "yes" | "no" | "";
    opportunityToTalkWithPolice: "yes" | "no" | "";
    reasonNoPrivateTalk?: string;
    rightsExplained: string[];
    rightsExplainedOptional: string[];
    ypUnderstandsRights: "yes" | "no" | "";
    understandingEvidence?: string;
    ypSoughtRights: {
      friendOrRelative: { sought: "yes" | "no" | ""; contactMade?: "yes" | "no" | "" };
      interpreter: { sought: "yes" | "no" | ""; contactMade?: "yes" | "no" | "" };
      yrippLegalService: { sought: "yes" | "no" | ""; contactMade?: "yes" | "no" | "" };
      valsLawyer: { sought: "yes" | "no" | ""; contactMade?: "yes" | "no" | "" };
      otherLawyer: { sought: "yes" | "no" | ""; contactMade?: "yes" | "no" | "" };
      other: { sought: "yes" | "no" | ""; contactMade?: "yes" | "no" | ""; specify?: string };
    };
    contactNotSuccessfulReason?: string;
    reasonNoLegalAdvice?: string;
    englishAdequate: "yes" | "no" | "";
    interpreterContacted: "yes" | "no" | "";
    whyNoInterpreterNeeded?: string;
    fitForInterview: "yes" | "no" | "";
    notFitReason?: string;
    stepsTaken: string[];
    stepsTakenOther?: string;
  };

  interview: {
    informant: InterviewOfficer;
    corroborator: InterviewOfficer;
    interviewTimes: InterviewTimes;
    witnessedActions: WitnessedAction[];
  };

  outcome: {
    interviewOutcome: string;
    interviewOutcomeOther?: string;
    ypUnderstoodOutcome: "yes" | "no" | "";
    understandingEvidence?: string;
    bailHearingSupport: string;
    bailHearingSupportOther?: string;
    bailHearingOutcome: "remanded" | "grantedBail" | "" | "notApplicable";
  };

  ipConcerns: {
    hasConcerns: "yes" | "no" | "";
    concernAbout: string[];
    concernAboutOther?: string;
    personName?: string;
    actionTaken?: string;
  };

  sectionBPartB: {
    hasWorker: string[];
    hasWorkerOther?: string;
    referralServices: {
      legalService: { faxed: boolean; card: boolean };
      housing: { faxed: boolean; card: boolean };
      counselling: { faxed: boolean; card: boolean };
      healthService: { faxed: boolean; card: boolean };
      drugAlcohol: { faxed: boolean; card: boolean };
      indigenous: { faxed: boolean; card: boolean };
      migrantRefugee: { faxed: boolean; card: boolean };
      genericYouth: { faxed: boolean; card: boolean };
      educationEmployment: { faxed: boolean; card: boolean };
      schoolTeacher: { faxed: boolean; card: boolean };
      disability: { faxed: boolean; card: boolean };
      other: { faxed: boolean; card: boolean; specify?: string };
    };
    referralServicesNames?: string;
    referralNotWantedReason?: string;
    permissionToRecordContact: "yes" | "no" | "";
    contactDetails?: {
      fullName: string;
      addressLine1: string;
      addressLine2: string;
      phone: string;
      contactThroughOther: {
        name: string;
        relationship: string;
        phone: string;
      };
    };
    happyWithTreatment: "yes" | "no" | "";
    treatmentConcerns?: string;
    ypWantsAction: string[];
    ypWantsActionOther?: string;
  };

  sectionE: {
    spokeToSergeant: "yes" | "no" | "";
    sergeantRank?: string;
    sergeantName?: string;
    propertyReturned: "yes" | "no" | "";
    propertyNotReturnedReason?: string;
    concernsRaisedWithSergeant: "yesByYP" | "yesByIP" | "none" | "";
    concernsRaisedDetails?: string;
    accommodationForNight: "yes" | "no" | "";
    accommodationAction?: string;
    transportationHome: string[];
    transportationHomeOther?: string;
    sawYpLeave: "yes" | "no" | "";
    whatOccurred: string[];
    whatOccurredOther?: string;
    interviewCancelledAfterLeftHome: boolean;
    interviewCancelledBeforeLeftHome: boolean;
    coAccusedSupport?: string;
    coAccusedSupportOther?: string;
    wantYRIPPFollowUp: "yes" | "no" | "";
    leftStationTime: string;
  };

  sectionF: {
    additionalNotes: string;
  };

  officeUse: {
    callId: string;
    relatedCallId: string;
    directReferral: "yes" | "no" | "";
    irsReceived: string;
    receivedDate: string;
    receivedBy: string;
  };

  metadata: {
    createdAt: string;
    updatedAt: string;
    ipName?: string;
    ipId?: string;
    draft: boolean;
    submitted: boolean;
    submittedAt?: string;
    editHistory?: Array<{
      editedBy: string;
      editedByName: string;
      editedAt: string;
      editReason: string;
      role: "admin" | "staff";
    }>;
    deleted?: {
      deletedBy: string;
      deletedByName: string;
      deletedAt: string;
      deleteReason: string;
      role: "staff";
    };
  };
}
