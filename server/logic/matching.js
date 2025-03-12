class Matcher {
    constructor(mentors, mentees) {
      this.mentors = mentors.map(m => ({
        ...m,
        preferences: m.rankings.map(r => r.profile), 
        matches: []
      }));
  
      this.mentees = mentees.map(e => ({
        ...e,
        preferences: e.rankings.map(r => r.profile), 
        currentProposal: 0,
        matched: false
      }));
    }
  
    run() {
      let hasUnmatched;
      do {
        hasUnmatched = false;
        this.mentees.forEach(mentee => {
          if (!mentee.matched && mentee.currentProposal < mentee.preferences.length) {
            const mentorId = mentee.preferences[mentee.currentProposal];
            const mentor = this.mentors.find(m => m._id.equals(mentorId));
            if (mentor) {
              mentor.matches.push(mentee);
              this.evaluateMatches(mentor);
            }
            mentee.currentProposal++;
            hasUnmatched = true;
          }
        });
      } while (hasUnmatched);
    }
  
    evaluateMatches(mentor) {
      // Sort by mentor's preferences
      mentor.matches.sort((a, b) => {
        const aIndex = mentor.preferences.findIndex(id => id.equals(a._id));
        const bIndex = mentor.preferences.findIndex(id => id.equals(b._id));
        return aIndex - bIndex;
      });
  
      // Trim excess matches
      while (mentor.matches.length > mentor.maxSpots) {
        const rejected = mentor.matches.pop();
        rejected.matched = false;
      }
  
      mentor.matches.forEach(m => { m.matched = true; });
    }

    // Returns unmatches users
    getUnmatched() {
        const unmatchedMentees = this.mentees.filter(mentee => !mentee.matched);
        const unmatchedMentors = this.mentors.filter(mentor => mentor.matches.length < mentor.maxSpots);
      
        return {
          unmatchedMentees,
          unmatchedMentors
        };
      }
    
  }
  
  module.exports = Matcher;